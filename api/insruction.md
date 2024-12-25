<!-- Your task is to go through the lists of glossary available in glossary-simplified.json and create a glossary-v2.json which contains definitions for each glossary terms.

This also means , you would need to scrape the definition of from the url of each term, the definition page have this url:

`https://www.mlb.com/glossary/standard-stats/assist`

when you load the page, focus on extracting the definition from the dom having this structure:

```html
<div
  class="p-wysiwyg styles-sc-1ewxgrh-0 styles-sc-9861x0-0 caUmUK janZbC"
  data-content-id="5272d11d-c4a3-477a-998c-b660cc468f67"
  data-slug="glossary-assist"
>
  <h1>Assist (A)</h1>
  <h3>Definition</h3>
  <p>
    An assist is awarded to a fielder who touches the ball before a putout is
    recorded by another fielder. Typically, assists are awarded to fielders when
    they throw the ball to another player -- but a fielder receives an assist as
    long as he touches the ball, even if the contact was unintentional. For
    example, on a line drive that strikes the pitcher before caroming to the
    shortstop, both the pitcher and shortstop are awarded an assist if the out
    is made on a throw to first base.
  </p>
  <p>
    There is an assist awarded on most ground-ball outs -- because most
    ground-ball outs require a defender to throw the ball to another defender.
    However, there can also be assists on fly balls -- when a runner tries to
    advance, but the outfielder (or in rare cases, the infielder) throws him out
    or doubles him off.
  </p>
  <p>
    There is a maximum of one assist per player per out recorded. If a player
    touches the ball twice in a rundown, where the runner is eventually tagged
    out, that player is only credited with one assist for that out. Pitchers are
    not awarded assists for strikeouts.
  </p>
  <h5>In A Call</h5>
  <p>"gets the assist"</p>
</div>
```

Use axios for this. -->

I dont think the glossary.json file is complete, check the dom content for the glossary terms:

```html
<div class="l-grid__col l-grid__col--transparent">
  <div class="l-grid__content">
    <div
      class="l-grid__content l-grid__content--flat-card t-secondary u-app-hide"
      data-layout="Basic Layout"
      data-content-id="363b9c1a-e92c-4def-bb29-015f9f034059"
    >
      <div class="l-grid l-grid--gutters">
        <div class="l-grid__col l-grid__col--transparent">
          <div class="l-grid__content">
            <div
              class="p-heading p-heading--none p-heading--center styles-sc-zrz8sa-0 ezaLfI"
              data-content-id="1f503f4f-f959-487e-9d3a-b432dbd9a547"
            >
              <h2
                class="p-heading__text p-heading__text--none p-heading__text--center p-heading__text--h2 styles-sc-zrz8sa-0 ezaLfI"
              >
                STANDARD STATS
              </h2>
              <span
                class="p-heading__subtitle styles-sc-zrz8sa-0 ezaLfI"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="p-heading p-heading--lined p-heading--center styles-sc-zrz8sa-0 ezaLfI"
      data-content-id="ead243c7-e048-4d81-9833-d0d542c7052d"
    >
      <h3
        class="p-heading__text p-heading__text--lined p-heading__text--center p-heading__text--h3 styles-sc-zrz8sa-0 ezaLfI"
      >
        DEFENSE
      </h3>
      <span class="p-heading__subtitle styles-sc-zrz8sa-0 ezaLfI"></span>
    </div>
    <div
      class="p-related-links styles-sc-7wot8d-0 eecIFP"
      data-content-id="1894919d-9caf-4d4f-ab94-0bf5429c91a8"
    >
      <ul class="p-related-links__list">
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="9297ac15-92bb-49fb-bfc4-dae2c0ecc838"
            href="/glossary/standard-stats/assist"
            >Assist (A)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="caaf211f-0bc4-4ff1-8f71-b6dac59ff54d"
            href="/glossary/standard-stats/caught-stealing-percentage"
            >Caught Stealing Percentage (CS%)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="b3e32052-c56f-4e2c-baf5-3fd1867e932d"
            href="/glossary/standard-stats/double-play"
            >Double Play (DP)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="28517915-84bc-4509-9b15-2edfb9b7431a"
            href="/glossary/standard-stats/error"
            >Error (E)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="a1fc7a59-85e8-4b9a-a88d-84cd91df9e2d"
            href="/glossary/standard-stats/fielding-percentage"
            >Fielding Percentage (FPCT)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="1f5fbce6-0a18-403b-8b6c-1b11f76e54b7"
            href="/glossary/standard-stats/innings-played"
            >Innings Played (INN)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="8435675a-34a2-4128-8bf1-cdca901cddcb"
            href="/glossary/standard-stats/out"
            >Out (O)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="bd3910c9-70a2-4db1-b7c7-f97e8983786b"
            href="/glossary/standard-stats/outfield-assist"
            >Outfield Assist (OFA)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="01c92afc-bddb-47d7-a817-f654f6880d81"
            href="/glossary/standard-stats/passed-ball"
            >Passed Ball (PB)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="0d06aa04-3495-4203-ad72-1ca465aa4bf9"
            href="/glossary/standard-stats/putout"
            >Putout (PO)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="ba4a8e40-6c83-4e8c-a444-1ad447ea9c9f"
            href="/glossary/standard-stats/total-chances"
            >Total Chances (TC)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="c8cb1c18-2600-4bdd-b38d-8f1996f7a145"
            href="/glossary/standard-stats/triple-play"
            >Triple Play (TP)</a
          >
        </li>
      </ul>
    </div>
    <div
      class="p-heading p-heading--lined p-heading--center styles-sc-zrz8sa-0 ezaLfI"
      data-content-id="8e7f989c-bb97-47d3-a4fb-a2b3b10c1289"
    >
      <h3
        class="p-heading__text p-heading__text--lined p-heading__text--center p-heading__text--h3 styles-sc-zrz8sa-0 ezaLfI"
      >
        OFFENSE
      </h3>
      <span class="p-heading__subtitle styles-sc-zrz8sa-0 ezaLfI"></span>
    </div>
    <div
      class="p-related-links styles-sc-7wot8d-0 eecIFP"
      data-content-id="323a816a-077b-493a-a56b-0b29f54c712b"
    >
      <ul class="p-related-links__list">
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="4001fc07-d62c-4bd4-be6a-733c0c6d8f16"
            href="/glossary/standard-stats/at-bat"
            >At-bat (AB)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="cd522d4f-a4e5-4bb3-804e-ab08977f66ac"
            href="/glossary/standard-stats/batting-average"
            >Batting Average (AVG)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="0ecf168e-fba9-49f1-9e61-1f3a61d597aa"
            href="/glossary/standard-stats/caught-stealing"
            >Caught Stealing (CS)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="03ea37a9-7e08-4e53-9560-d61ad4cedf15"
            href="/glossary/standard-stats/double"
            >Double (2B)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="1b1f4670-dc84-45b6-9684-2ec4116faa46"
            href="/glossary/standard-stats/extra-base-hit"
            >Extra-base Hit (XBH)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="8d413090-b3ed-4558-9ee8-ee61891458a3"
            href="/glossary/standard-stats/games-played"
            >Games Played (G)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="10b4d1b7-753f-4d5c-b4be-4d67717a125c"
            href="/glossary/standard-stats/grand-slam"
            >Grand Slam (GSH)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="78747f28-6c9b-4b42-85d4-cf2e49d2c075"
            href="/glossary/standard-stats/ground-into-double-play"
            >Ground Into Double Play (GIDP)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="86818fe9-fbc2-4c5a-968b-47ab32b724f1"
            href="/glossary/standard-stats/groundout-to-airout-ratio"
            >Groundout-to-Airout Ratio (GO/AO)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="7a54c7db-6f99-4039-98b5-e32b0b5e0947"
            href="/glossary/standard-stats/hit-by-pitch"
            >Hit-by-pitch (HBP)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="a24cd4f4-a77f-4291-a938-bc875b1eba50"
            href="/glossary/standard-stats/hit"
            >Hit (H)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="1d70ee44-e054-45c2-b1b7-210775276717"
            href="/glossary/standard-stats/home-run"
            >Home Run (HR)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="dce0cc35-1fc3-42c0-a699-ffd63ce62075"
            href="/glossary/standard-stats/intentional-walk"
            >Intentional Walk (IBB)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="87d17790-8a88-4de0-a717-5c05680dc1d8"
            href="/glossary/standard-stats/left-on-base"
            >Left On Base (LOB)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="d0fa7889-7a19-4806-bbf7-929a34b1383d"
            href="/glossary/standard-stats/on-base-percentage"
            >On-base Percentage (OBP)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="ee32e30c-0c4f-4352-8b19-e34ee1655870"
            href="/glossary/standard-stats/on-base-plus-slugging"
            >On-base Plus Slugging (OPS)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="fe1d0cce-442e-42fe-96ea-1138254f7676"
            href="/glossary/standard-stats/plate-appearance"
            >Plate Appearance (PA)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="f81fb427-61a9-425b-ae75-b5e849e2dc60"
            href="/glossary/standard-stats/rate-stats-qualifiers"
            >Rate Stats Qualifiers</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="8301838b-0a85-4ae4-8557-8bd8c49bd42b"
            href="/glossary/standard-stats/reached-on-error"
            >Reached On Error (ROE)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="e465ba04-eac4-4ae8-8c65-c195f63de169"
            href="/glossary/standard-stats/run"
            >Run (R)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="9b32e504-6141-42f9-96f4-e3cc14513c90"
            href="/glossary/standard-stats/runs-batted-in"
            >Runs Batted In (RBI)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="da498de4-7b13-4f4b-b426-0a7f6b5cafd2"
            href="/glossary/standard-stats/sacrifice-bunt"
            >Sacrifice Bunt (SH)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="d60c85f6-1cee-402f-890b-22158ff3774a"
            href="/glossary/standard-stats/sacrifice-fly"
            >Sacrifice Fly (SF)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="f3a14a7d-b26f-4b05-bcd7-a394ef34ab62"
            href="/glossary/standard-stats/single"
            >Single (1B)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="86764587-a35d-4f66-ae50-6e6ed9a274c7"
            href="/glossary/standard-stats/slugging-percentage"
            >Slugging Percentage (SLG)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="517a0c2a-ee5a-4e9c-84e1-976ddff95df5"
            href="/glossary/standard-stats/stolen-base"
            >Stolen Base (SB)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="461ee6a1-42d5-43ab-99cc-ba93f2b2f272"
            href="/glossary/standard-stats/stolen-base-percentage"
            >Stolen-base Percentage (SB%)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="b21dc4e7-381f-4e05-8447-fb7cb7588498"
            href="/glossary/standard-stats/total-bases"
            >Total Bases (TB)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="eae10f44-1de0-485e-acf4-1b7fd89f13b1"
            href="/glossary/standard-stats/triple"
            >Triple (3B)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="d46c016c-75b4-47ff-b173-68c3e6f85f5f"
            href="/glossary/standard-stats/walk"
            >Walk (BB)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="629aa246-daf2-4cd4-8e35-970f0b3d2ad9"
            href="/glossary/standard-stats/walk-off"
            >Walk-off (WO)</a
          >
        </li>
      </ul>
    </div>
    <div
      class="p-heading p-heading--lined p-heading--center styles-sc-zrz8sa-0 ezaLfI"
      data-content-id="a759cc3f-baa0-4e8a-bdd4-e60ff18df721"
    >
      <h3
        class="p-heading__text p-heading__text--lined p-heading__text--center p-heading__text--h3 styles-sc-zrz8sa-0 ezaLfI"
      >
        PITCHING
      </h3>
      <span class="p-heading__subtitle styles-sc-zrz8sa-0 ezaLfI"></span>
    </div>
    <div
      class="p-related-links styles-sc-7wot8d-0 eecIFP"
      data-content-id="d3ccb7fb-7e3c-45a6-87d0-409546af29c8"
    >
      <ul class="p-related-links__list">
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="1cc0a4f5-2e03-4941-b54c-f7ac50308f4d"
            href="/glossary/standard-stats/appearance"
            >Appearance (App)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="b6aec0b1-67af-4737-b8fb-cc48a9be079a"
            href="/glossary/standard-stats/balk"
            >Balk (BK)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="c720c8c1-af72-4151-b15c-e4f93497e4be"
            href="/glossary/standard-stats/batters-faced"
            >Batters Faced (BF)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="0c3c9c1b-ac6d-404e-bae3-bcf6067e0176"
            href="/glossary/standard-stats/blown-save"
            >Blown Save (BS)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="0e7350bd-bed3-4009-9a1d-e4ea6d181df6"
            href="/glossary/standard-stats/complete-game"
            >Complete Game (CG)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="d8d0fbcf-00b2-467a-b9fb-200986d40165"
            href="/glossary/standard-stats/earned-run"
            >Earned Run (ER)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="bcd57e8e-06b6-4a78-bb55-eaa40bb32277"
            href="/glossary/standard-stats/earned-run-average"
            >Earned Run Average (ERA)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="7eb3dc4d-6bbc-4f6d-96ae-02f55d1c7303"
            href="/glossary/standard-stats/flyout"
            >Flyout</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="dbe7294f-b739-4070-96a6-4269adb967d4"
            href="/glossary/standard-stats/games-finished"
            >Games Finished (GF)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="60cc4353-4657-4f5e-91cc-c6667625f088"
            href="/glossary/standard-stats/games-started"
            >Games Started (GS)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="47225058-928b-4fb3-92df-83405e5ddf55"
            href="/glossary/standard-stats/groundout"
            >Groundout</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="46a8a884-acf2-4a04-bffc-6f458d61f3c3"
            href="/glossary/standard-stats/hold"
            >Hold (HLD)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="cd179c5e-d20d-4366-919f-3c1fc118c6c2"
            href="/glossary/standard-stats/inherited-runner"
            >Inherited Runner (IR)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="5b9f7116-2b86-4c97-8420-6ea43f50dcc4"
            href="/glossary/standard-stats/innings-pitched"
            >Innings Pitched (IP)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="7046631b-18e5-4239-b7ca-495971501d8b"
            href="/glossary/standard-stats/loss"
            >Loss (L)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="565b1c18-ddb7-461f-907a-3707977337be"
            href="/glossary/standard-stats/number-of-pitches"
            >Number of Pitches (NP)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="59b2a28b-3672-4af2-875a-543a38524343"
            href="/glossary/standard-stats/pickoff"
            >Pickoff (PK)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="70787a12-e2ba-429b-a605-0fc6d3cde01f"
            href="/glossary/standard-stats/quality-start"
            >Quality Start (QS)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="7ad3c5b6-516f-4c70-874a-a65ea0a6f3f6"
            href="/glossary/standard-stats/rate-stats-qualifiers"
            >Rate Stats Qualifiers</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="3e4693a0-fdec-4bfc-af14-6d6f253fc608"
            href="/glossary/standard-stats/relief-win"
            >Relief Win (RW)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="67bf91cb-6c14-44d1-b258-3e6283fae77d"
            href="/glossary/standard-stats/save"
            >Save (SV)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="3903a666-34e9-42a2-a415-4e038f74cd41"
            href="/glossary/standard-stats/save-opportunity"
            >Save Opportunity (SVO)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="3916be19-f95a-49a0-8ce5-fc309baa22e8"
            href="/glossary/standard-stats/save-percentage"
            >Save Percentage (SV%)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="d92c8805-b867-4953-8564-531eb7f6ea6f"
            href="/glossary/standard-stats/shutout"
            >Shutout (SHO)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="95610dc5-8672-425e-8065-3d54d057a400"
            href="/glossary/standard-stats/strikeout"
            >Strikeout (SO, K)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="1bf94f94-74d9-4e32-8964-75762a6a077c"
            href="/glossary/standard-stats/unearned-run"
            >Unearned Run (UER)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="499277cc-d6b6-43bf-a0a3-4dcbd527c421"
            href="/glossary/standard-stats/walks-and-hits-per-inning-pitched"
            >Walks And Hits Per Inning Pitched (WHIP)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="5406eabb-4064-4ace-ab67-8ab4dfe1d1b0"
            href="/glossary/standard-stats/wild-pitch"
            >Wild Pitch (WP)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="d0ef8641-f1a8-4840-83ea-84b9ec7f1fa2"
            href="/glossary/standard-stats/win"
            >Win (W)</a
          >
        </li>
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="06b17f26-b297-4951-959b-08d2ea52c703"
            href="/glossary/standard-stats/winning-percentage"
            >Winning Percentage (WPCT)</a
          >
        </li>
      </ul>
    </div>
    <div
      class="p-heading p-heading--lined p-heading--center styles-sc-zrz8sa-0 ezaLfI"
      data-content-id="64866619-2148-45dc-8168-837b095f029a"
    >
      <h3
        class="p-heading__text p-heading__text--lined p-heading__text--center p-heading__text--h3 styles-sc-zrz8sa-0 ezaLfI"
      >
        TEAM
      </h3>
      <span class="p-heading__subtitle styles-sc-zrz8sa-0 ezaLfI"></span>
    </div>
    <div
      class="p-related-links styles-sc-7wot8d-0 eecIFP"
      data-content-id="32a41277-1b29-410a-9e07-d264abb22eeb"
    >
      <ul class="p-related-links__list">
        <li class="p-related-links__item">
          <a
            class="p-related-links__link"
            data-cid="fae94e31-028a-4e8c-b32d-b61579607830"
            href="/glossary/standard-stats/run-differential"
            >Run Differential</a
          >
        </li>
      </ul>
    </div>
  </div>
</div>
```

some term doesn't exists in that file, how about you create a new script which scrapes glossary-terms off from https://www.mlb.com/glossary to output a glossary-terms.json file with the format of glossary.json.

i.e

```json
[
  {
    "id": "on-base-percentage",
    "title": "On-base Percentage",
    "url": ""
  }
]
```

Remove any abbrevation from the title if it surrounded by () braces.
