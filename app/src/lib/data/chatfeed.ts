


export const fakeSources = [
    {
        title: "The New York Times",
        url: "https://www.nytimes.com/2023/08/16/sports/baseball/dodgers-mlb-games.html",
        description: "The Dodgers are the best team in the MLB for sure",
        seo: {
            favicon: "https://www.nytimes.com/favicon.ico",
            site_name: "The New York Times",
        },
        image: "https://media.cnn.com/api/v1/images/stellar/prod/sandoy-tunnel-olavur-fredriksen3.jpg",
    },
    {
        title: "CNN Sports",
        url: "https://www.cnn.com/2023/08/15/sports/nba-playoffs-preview/index.html",
        description: "A deep dive into the upcoming NBA playoffs and team strategies.",
        seo: {
            favicon: "https://edition.cnn.com/media/sites/cnn/favicon.ico",
            site_name: "CNN Sports",
        },
        image: "https://media.cnn.com/api/v1/images/stellar/prod/eysturoy-tunnel-olavurfredriksen.jpg",
    },
    {
        title: "ESPN",
        url: "https://www.espn.com/nfl/story/_/id/1234567890/nfl-playoff-predictions-2023",
        description: "Experts predict the outcomes of the 2023 NFL playoffs.",
        seo: {
            favicon: "https://www.espn.com/favicon.ico",
            site_name: "ESPN",
        },
        image: "https://media.cnn.com/api/v1/images/stellar/prod/skarvanes-sandoy-michiel-pieters-michielpieters-ii.jpg",
    },
    {
        title: "BBC Sport",
        url: "https://www.bbc.com/sport/cricket/12345678",
        description: "Analysis of the latest cricket matches and player performances.",
        seo: {
            favicon: "https://www.bbc.com/favicon.ico",
            site_name: "BBC Sport",
        },
        image: "https://ichef.bbci.co.uk/live-experience/cps/624/cpsprodpb/B0C9/production/_123456789_cricket.jpg",
    },
    {
        title: "The Guardian - Football",
        url: "https://www.theguardian.com/football/2023/oct/10/premier-league-review-week-8",
        description: "A review of the top matches from the Premier League week 8.",
        seo: {
            favicon: "https://www.theguardian.com/favicon.ico",
            site_name: "The Guardian",
        },
        image: "https://i.guim.co.uk/img/media/b1234567890.jpg?width=1200&quality=85&auto=format&fit=max&s=abcdefg1234567",
    },
    {
        title: "Bleacher Report - NBA",
        url: "https://bleacherreport.com/articles/nba-trade-deadline-2023-preview",
        description: "What to expect from the upcoming NBA trade deadline.",
        seo: {
            favicon: "https://bleacherreport.com/favicon.ico",
            site_name: "Bleacher Report",
        },
        image: "https://img.bleacherreport.net/img/images/photos/003/12345678.jpg?h=900&w=1200&q=70&crop=faces&bg=white",
    },
    {
        title: "Sports Illustrated - NFL News",
        url: "https://www.si.com/nfl/news/nfl-week-10-recap-2023",
        description: "Recap of NFL week 10 and standout performances.",
        seo: {
            favicon: "https://www.si.com/favicon.ico",
            site_name: "Sports Illustrated",
        },
        image: "https://cdn.si.com/images/nfl-week-10-recap.jpg?v=1234567890",
    },
    {
        title: "Yahoo Sports - MLB Updates",
        url: "https://sports.yahoo.com/mlb-updates-weekly-roundup-2023-123456789.html",
        description: "Weekly roundup of MLB updates and player statistics.",
        seo: {
            favicon: "https://sports.yahoo.com/favicon.ico",
            site_name: "Yahoo Sports",
        },
        image: "https://s.yimg.com/os/creatr-uploaded-images/2023-12/mlb-updates.jpg?w=1200&h=900&fit=crop&crop=faces&auto=format&format=jpg&ixlib=js-2.1.0&q=80&fm=pjpg&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8MTYxNjYzNjM4Ng&auto=format&fit=max&s=b5e1c4e7d1e6a1b2c5a2d6c7d9d75ee9", 
    },
    {
      title: 'NBC Sports',
      url:' https://www.nbcsports.com/nba/news/nba-all-star-game-2023-preview',
      description:'Preview of the 2023 NBA All-Star Game and player selections.',
      seo:{
          favicon:' https://www.nbcsports.com/favicon.ico',
          site_name:'NBC Sports',
      },
      image:' https://nbcsports.com/assets/images/nba-all-star-game-preview.jpg',
   }
];


export const fakeMessages = [
    {
        role: "",
        content: "I want to know if the Dodgers are going to win the World Series",
    },
    {
        role: "ai",
        content: "The Dodgers are the best team in the MLB for sure. They are going to win the World Series. They have the best pitcher, the best hitter, and the best fielder. They are going to dominate the whole league. I bet my life on it.",
        sources: [0,3,2], // index for fakeResources (in-dev only)
    },
    {
        role: "",
        content: "What do you think about the Yankees?",
    },
    {
        role: "ai",
        content: "The Yankees are the most successful team in the MLB, with 27 World Series titles. They have a strong lineup and a deep bullpen. But they are not the best team in the league. The Dodgers are the best team. They have the best pitcher, the best hitter, and the best fielder. They are going to win the World Series.",
        sources: [0,2], // index for fakeResources (in-dev only)
    },
    {
        role: "",
        content: "What about the Red Sox?",
    },
    {
        role: "ai",
        content: "The Red Sox are a good team. They have a strong lineup and a deep bullpen. But they are not the best team in the league. The Dodgers are the best team. They have the best pitcher, the best hitter, and the best fielder. They are going to win the World Series.",
        sources: [0,2], // index for fakeResources (in-dev only)
    },
]