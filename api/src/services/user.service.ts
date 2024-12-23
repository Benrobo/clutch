import prisma from "../prisma/index.js";
import short from "short-uuid";
import { users } from "@prisma/client";
import { HttpException } from "../lib/exception.js";

export default class UserService {
  async findUserByEmail(email: string) {
    return await prisma.users.findFirst({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });
  }

  async findUserById(id: string) {
    return await prisma.users.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });
  }

  async createUser(email: string, name: string, avatar: string) {
    const id = short.generate();
    return await prisma.users.create({
      data: {
        id,
        email,
        name,
        avatar,
      },
    });
  }

  async createOrUpdateUser(
    data: Omit<
      users,
      "created_at" | "updated_at" | "google_ref_token" | "preferences"
    >
  ) {
    const user = await prisma.users.findFirst({ where: { email: data.email } });
    if (user) {
      return await prisma.users.update({
        where: { id: user.id },
        data,
      });
    } else {
      return await prisma.users.create({
        data,
      });
    }
  }
  async getAllUsers() {
    return await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async validateTeams(teamIds: number[]) {
    const teamsExist = await prisma.teams.findMany({
      where: {
        id: {
          in: teamIds
        }
      },
      select: {
        id: true
      }
    });

    const foundTeamIds = teamsExist.map(team => team.id);
    const invalidTeamIds = teamIds.filter(id => !foundTeamIds.includes(id));

    if (invalidTeamIds.length > 0) {
      throw new HttpException(`Invalid team IDs: ${invalidTeamIds.join(', ')}`, 400);
    }

    return true;
  }

  async savePreference(userId: string, preferences: { teams: number[], players: number[] }) {
    return await prisma.users.update({
      where: { id: userId },
      data: {
        preferences: preferences
      }
    });
  }
}
