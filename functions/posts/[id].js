const GA_ID = "G-6MDHM4W6BH";

export async function onRequestGet(context) {
  const { id } = context.params;
  const { env, request } = context;

  // 投稿IDは数字のみ
  if (!/^\d+$/.test(id)) {
    return notFound();
  }

  // KVから投稿データ取得
  const post = await env.POSTS.get(id, "json");

  if (!post) {
    return notFound();
  }

  const url = new URL(request.url);

  const canonicalUrl =
    `${url.origin}/posts/${encodeURIComponent(id)}`;


  // ========================================
  // 投稿IDから画像パスを自動生成
  // ========================================

  const baseImagePath =
    `/assets/images/posts/${id}`;

  const ogpImageUrl =
    new URL(
      `${baseImagePath}/ogp.webp`,
      url.origin
    ).href;

  const introMainImageUrl =
    new URL(
      `${baseImagePath}/main.webp`,
      url.origin
    ).href;

  const fanboxImage1Candidate =
    new URL(
      `${baseImagePath}/fanbox01.webp`,
      url.origin
    ).href;


  const fanboxImage1Response =
    await env.ASSETS.fetch(
      new Request(
        fanboxImage1Candidate,
        {
          method: "HEAD"
        }
      )
    );


  const fanboxImage1 =
    fanboxImage1Response.ok
      ? fanboxImage1Candidate
      : ogpImageUrl;


  const fanboxImage2 =
    new URL(
      `${baseImagePath}/fanbox02.webp`,
      url.origin
    ).href;


  // ========================================
  // FANBOXカード1
  // ========================================

  const fanboxCard1 = {

    text:
      post.continue_text_1 || "",

    url:
      safeExternalUrl(
        post.fanbox_url_1
      ),

    title:
      post.fanbox_title_1 || "",

    description:
      post.fanbox_description_1 || "",

    image:
      fanboxImage1

  };


  // ========================================
  // FANBOXカード2
  // ========================================

  const fanboxCard2 = {

    text:
      post.continue_text_2 || "",

    url:
      safeExternalUrl(
        post.fanbox_url_2
      ),

    title:
      post.fanbox_title_2 || "",

    description:
      post.fanbox_description_2 || "",

    image:
      fanboxImage2

  };


  // ========================================
  // Fantia / Ci-en
  // ========================================

  const fantiaUrl =
    safeExternalUrl(
      post.fantia_url
    );

  const cienUrl =
    safeExternalUrl(
      post.cien_url
    );


  const html = renderPage({

    id,

    title:
      post.title || "M2坊",

    description:
      post.description || "",

    publishedAt:
      post.published_at || "",

    canonicalUrl,

    ogpImageUrl,

    introMainImageUrl,

    fanboxCard1,

    fanboxCard2,

    fantiaUrl,

    cienUrl

  });


  return new Response(
    html,
    {
      status: 200,

      headers: {

        "Content-Type":
          "text/html; charset=UTF-8",

        "Cache-Control":
          "public, max-age=60"

      }
    }
  );
}



/* =========================================================
   PAGE
========================================================= */

function renderPage({
  id,
  title,
  description,
  publishedAt,
  canonicalUrl,
  ogpImageUrl,
  introMainImageUrl,
  fanboxCard1,
  fanboxCard2,
  fantiaUrl,
  cienUrl
}) {

  const safeId =
    escapeHtml(id);

  const safeTitle =
    escapeHtml(title);

  const safeDescription =
    escapeHtml(description);

  const safeDate =
    escapeHtml(publishedAt);

  const safeCanonical =
    escapeHtml(canonicalUrl);

  const safeOgpImage =
    escapeHtml(ogpImageUrl);


  // ========================================
  // FANBOX
  // ========================================

  const fanbox1Html =
    renderFanboxBlock({

      slot: "1",

      text:
        fanboxCard1.text,

      url:
        fanboxCard1.url,

      title:
        fanboxCard1.title,

      description:
        fanboxCard1.description,

      image:
        fanboxCard1.image

    });


  const fanbox2Html =
    renderFanboxBlock({

      slot: "2",

      text:
        fanboxCard2.text,

      url:
        fanboxCard2.url,

      title:
        fanboxCard2.title,

      description:
        fanboxCard2.description,

      image:
        fanboxCard2.image

    });


  const hasContinue =
    Boolean(
      fanbox1Html ||
      fanbox2Html
    );


  // ========================================
  // Fantia
  // ========================================

  const fantiaButton =
    fantiaUrl
      ? secondaryButton({

          id:
            "support-fantia",

          url:
            fantiaUrl,

          name:
            "Fantia",

          destination:
            "fantia"

        })
      : "";


  // ========================================
  // Ci-en
  // ========================================

  const cienButton =
    cienUrl
      ? secondaryButton({

          id:
            "support-cien",

          url:
            cienUrl,

          name:
            "Ci-en",

          destination:
            "cien"

        })
      : "";


  const hasSecondary =
    Boolean(
      fantiaButton ||
      cienButton
    );


  return `<!doctype html>

<html lang="ja">

<head>

  <meta charset="utf-8">


  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >


  <title>
    ${safeTitle}｜M2坊
  </title>


  <meta
    name="description"
    content="${safeDescription}"
  >


  <link
    rel="canonical"
    href="${safeCanonical}"
  >


  <link
    rel="icon"
    href="/assets/images/favicon.ico"
  >



  <!-- =========================
       OGP
  ========================== -->

  <meta
    property="og:type"
    content="article"
  >

  <meta
    property="og:site_name"
    content="M2坊"
  >

  <meta
    property="og:title"
    content="${safeTitle}"
  >

  <meta
    property="og:description"
    content="${safeDescription}"
  >

  <meta
    property="og:url"
    content="${safeCanonical}"
  >

  <meta
    property="og:image"
    content="${safeOgpImage}"
  >

  <meta
    property="og:locale"
    content="ja_JP"
  >



  <!-- =========================
       X
  ========================== -->

  <meta
    name="twitter:card"
    content="summary_large_image"
  >

  <meta
    name="twitter:title"
    content="${safeTitle}｜M2坊"
  >

  <meta
    name="twitter:description"
    content="${safeDescription}"
  >

  <meta
    name="twitter:image"
    content="${safeOgpImage}"
  >



  <!-- =========================
     GA4
  ========================== -->

  <script
    async
    src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"
  ></script>

  <script>
    window.dataLayer =
      window.dataLayer || [];

    function gtag() {
      dataLayer.push(arguments);
    }

    gtag(
      "js",
      new Date()
    );

    gtag(
      "config",
      "${GA_ID}"
    );


    /* =========================
        流入元の独自判定
    ========================== */

    const urlParams =
      new URLSearchParams(
        window.location.search
      );

    const referrer =
      document.referrer || "";

    let referrerHost = "";

    try {
      referrerHost =
        referrer
          ? new URL(referrer).hostname
          : "";
    } catch {
      referrerHost = "";
    }


    /*
    * UTMがあれば最優先。
    * なければリファラーから判定。
    */
    let observedSource =
      urlParams.get("utm_source") || "";

    if (!observedSource) {

      if (
        referrerHost === "t.co" ||
        referrerHost === "x.com" ||
        referrerHost.endsWith(".x.com")
      ) {
        observedSource = "x";

      } else if (
        referrerHost === "iframely.net" ||
        referrerHost.endsWith(
          ".iframely.net"
        )
      ) {
        observedSource =
          "fanbox_iframely";

      } else if (
        referrerHost === "fanbox.cc" ||
        referrerHost.endsWith(
          ".fanbox.cc"
        )
      ) {
        observedSource = "fanbox";

      } else if (
        referrerHost === "pixiv.net" ||
        referrerHost.endsWith(
          ".pixiv.net"
        )
      ) {
        observedSource = "pixiv";

      } else if (referrerHost) {
        observedSource =
          referrerHost;

      } else {
        observedSource =
          "no_referrer";
      }
    }


    /* =========================
        記事閲覧イベント
    ========================== */

    gtag(
      "event",
      "post_view",
      {
        post_id: "${safeId}",

        observed_source:
          observedSource,

        observed_referrer:
          referrer || "(empty)"
      }
    );
  </script>


  <style>

    :root {

      --bg:
        #f7f6f3;

      --surface:
        #ffffff;

      --text:
        #171717;

      --muted:
        #77716a;

      --line:
        #e6e2dc;

      --accent:
        #d94b5b;

      --max:
        560px;

    }



    * {
      box-sizing:
        border-box;
    }



    html {

      background:
        var(--bg);

    }



    body {

      margin:
        0;

      background:
        var(--bg);

      color:
        var(--text);

      font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Hiragino Sans",
        "Hiragino Kaku Gothic ProN",
        "Yu Gothic",
        Meiryo,
        sans-serif;

      -webkit-font-smoothing:
        antialiased;

      line-height:
        1.65;

    }



    img {

      display:
        block;

      max-width:
        100%;

    }



    a {

      color:
        inherit;

      -webkit-tap-highlight-color:
        transparent;

    }



    main {

      width:
        min(
          calc(100% - 28px),
          var(--max)
        );

      margin:
        0 auto;

      padding:
        32px 0 64px;

    }



    /* =========================
       BRAND
    ========================== */

    .brand {

      margin:
        0 2px 22px;

      font-size:
        14px;

      font-weight:
        800;

    }

    .brand a {
      color: inherit;
      text-decoration: none;
    }



    /* =========================
       POST HEADER
    ========================== */

    .post-card {

      overflow:
        hidden;

      background:
        var(--surface);

      border:
        1px solid var(--line);

      border-radius:
        20px;

    }



    .post-head {

      padding:
        22px;

    }



    .date {

      margin:
        0 0 6px;

      color:
        var(--muted);

      font-size:
        10px;

    }



    h1 {

      margin:
        0 0 10px;

      font-size:
        clamp(
          22px,
          6vw,
          28px
        );

      line-height:
        1.42;

      letter-spacing:
        -.02em;

    }



    .description {

      margin:
        0;

      color:
        #67615b;

      font-size:
        12px;

      line-height:
        1.8;

      white-space:
        pre-line;

    }



    /* =========================
       SECTION
    ========================== */

    .section {

      margin-top:
        34px;

    }



    .section-label {

      display:
        block;

      margin:
        0 2px 5px;

      color:
        var(--accent);

      font-size:
        9px;

      font-weight:
        900;

      letter-spacing:
        .12em;

    }



    .section-label--secondary {

      color:
        #a49d95;

    }



    .section-title {

      margin:
        0 2px 13px;

      font-size:
        18px;

      line-height:
        1.4;

    }



    .section-title--secondary {

      color:
        #4d4944;

      font-size:
        15px;

    }



    /* =========================
       INTRO
    ========================== */

    .intro-image-wrap {

      overflow:
        hidden;

      background:
        var(--surface);

      border:
        1px solid var(--line);

      border-radius:
        20px;

    }



    .intro-main-image {

      width:
        100%;

      height:
        auto;

      object-fit:
        contain;

      background:
        #eeeae4;

    }



    /* =========================
       CONTINUE
    ========================== */

    .continue-block {

      margin-top:
        26px;

    }



    .continue-block:first-of-type {

      margin-top:
        0;

    }



    .continue-text {

      margin:
        0 2px 11px;

      color:
        #59544e;

      font-size:
        12px;

      font-weight:
        700;

      line-height:
        1.75;

      white-space:
        pre-line;

    }



    /* =========================
       FANBOX CARD
    ========================== */

    .fanbox-card {

      display:
        grid;

      grid-template-columns:
        136px
        minmax(0, 1fr);

      min-height:
        168px;

      overflow:
        hidden;

      background:
        var(--surface);

      border:
        1px solid var(--line);

      border-radius:
        18px;

      text-decoration:
        none;

      transition:
        transform .15s ease,
        box-shadow .15s ease,
        border-color .15s ease;

    }

    #fanbox-card-1 {
    
        border:
          3px solid #d99552;

        box-shadow:
          0 0 0 3px
          rgba(217, 149, 82, .14);

    }


    .fanbox-card__image {

      min-height:
        168px;

      overflow:
        hidden;

      background:
        #eeeae4;

      border-right:
        1px solid var(--line);

    }



    .fanbox-card__image img {

      width:
        100%;

      height:
        100%;

      min-height:
        168px;

      object-fit:
        cover;

    }



    .fanbox-card__body {

      min-width:
        0;

      display:
        flex;

      flex-direction:
        column;

      justify-content:
        center;

      padding:
        16px 14px;

    }



    .fanbox-card__service {

      margin-bottom:
        5px;

      color:
        var(--accent);

      font-size:
        9px;

      font-weight:
        900;

      letter-spacing:
        .06em;

    }



    .fanbox-card__title {

      margin:
        0 0 7px;

      font-size:
        14px;

      line-height:
        1.5;

    }



    .fanbox-card__description {

      display:
        -webkit-box;

      overflow:
        hidden;

      margin:
        0;

      color:
        var(--muted);

      font-size:
        9px;

      line-height:
        1.6;

      -webkit-line-clamp:
        3;

      -webkit-box-orient:
        vertical;

    }



    .fanbox-card__footer {

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        10px;

      margin-top:
        13px;

      color:
        #8d867f;

      font-size:
        9px;

      font-weight:
        700;

    }



    .fanbox-card__arrow {

      color:
        #aaa39b;

      font-size:
        18px;

      line-height:
        1;

    }


    .bounce-text span {
      display: inline-block;
      animation:
        char-bounce 2.8s
        ease-in-out
        infinite;
    }

    .bounce-text span:nth-child(1) {
      animation-delay: .15s;
    }

    .bounce-text span:nth-child(2) {
      animation-delay: 1.05s;
    }

    .bounce-text span:nth-child(3) {
      animation-delay: .42s;
    }

    .bounce-text span:nth-child(4) {
      animation-delay: 1.52s;
    }

    .bounce-text span:nth-child(5) {
      animation-delay: .78s;
    }

    .bounce-text span:nth-child(6) {
      animation-delay: 1.28s;
    }

    .bounce-text span:nth-child(7) {
      animation-delay: .03s;
    }

    @keyframes char-bounce {

      0%,
      12%,
      100% {
        transform: translateY(0);
      }

      5% {
        transform: translateY(-.6em);
      }

    }

    @media (prefers-reduced-motion: reduce) {

      .bounce-text span {
        animation: none;
      }

    }


    /* =========================
       OTHER LINKS
    ========================== */

    .secondary-grid {

      display:
        grid;

      grid-template-columns:
        repeat(
          2,
          minmax(0, 1fr)
        );

      gap:
        8px;

    }



    .secondary-link {

      min-height:
        62px;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        10px;

      padding:
        12px 14px;

      background:
        var(--surface);

      border:
        1px solid var(--line);

      border-radius:
        14px;

      color:
        #4d4944;

      text-decoration:
        none;

    }



    .secondary-link__name {

      font-size:
        12px;

      font-weight:
        800;

    }



    .secondary-link__arrow {

      color:
        #aaa39b;

      font-size:
        18px;

    }


    /* =========================
       POSTS INDEX LINK
    ========================== */


    .posts-index-link {

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      margin-top:
        24px;

      padding:
        12px 14px;

      border-top:
        1px solid var(--line);

      color:
        var(--muted);

      font-size:
        11px;

      font-weight:
        700;

      text-decoration:
        none;

    }


    /* =========================
       FOOTER
    ========================== */

    .footer {

      padding-top:
        34px;

      color:
        #aaa39b;

      text-align:
        center;

      font-size:
        9px;

    }

    .footer a {
      color: #8f8881;
      text-decoration: none;
    }

    .footer-link {

      font-size:
        10px;

      font-weight:
        600;

      text-underline-offset:
        3px;

      transition:
        color .15s ease,
        opacity .15s ease;

    }

    @media (hover: hover) {

      .footer a:hover {

        color:
          var(--text);

        text-decoration:
          underline;

      }

    }

    /* =========================
       HOVER
    ========================== */

    @media (hover: hover) {

      .fanbox-card:hover {

        transform:
          translateY(-1px);

        border-color:
          #d9d3cc;

        box-shadow:
          0 8px 24px
          rgba(40, 34, 28, .07);
  
      }

      #fanbox-card-1:hover {

          border-color:
            #d99552;

          box-shadow:
            0 8px 24px
            rgba(40, 34, 28, .07),
            0 0 0 3px
            rgba(217, 149, 82, .14);

      }


      .secondary-link:hover {

        background:
          #faf9f7;

      }

    }



    /* =========================
       MOBILE
    ========================== */

    @media (max-width: 390px) {

      main {

        width:
          calc(100% - 20px);

      }


      .post-head {

        padding:
          18px;

      }


      .fanbox-card {

        grid-template-columns:
          124px
          minmax(0, 1fr);

      }

    }



    @media (max-width: 340px) {

      .fanbox-card {

        grid-template-columns:
          108px
          minmax(0, 1fr);

      }


      .secondary-grid {

        grid-template-columns:
          1fr;

      }

    }

  </style>

</head>



<body>


  <main>


    <div class="brand">
      M2坊
    </div>



    <!-- =========================
         POST HEADER
    ========================== -->

    <article class="post-card">


      <div class="post-head">


        ${
          safeDate
            ? `
              <p class="date">
                ${safeDate}
              </p>
            `
            : ""
        }


        <h1>
          ${safeTitle}
        </h1>


        ${
          false
            ? `
              <p class="description">
                ${safeDescription}
              </p>
            `
            : ""
        }


      </div>


    </article>



    <!-- =========================
         FANBOX
    ========================== -->

    ${
      hasContinue

        ? `

          <section class="section">


            <span class="section-label">
              FANBOX
            </span>


            <h2 class="section-title">
              続きを見る
            </h2>


            ${fanbox1Html}


            ${fanbox2Html}


          </section>

        `

        : ""
    }



    <!-- =========================
         OTHER
    ========================== -->

    ${
      hasSecondary

        ? `

          <section class="section">


            <span
              class="
                section-label
                section-label--secondary
              "
            >
              OTHER
            </span>


            <h2
              class="
                section-title
                section-title--secondary
              "
            >
              ほかのサイトで見る
            </h2>


            <div class="secondary-grid">


              ${fantiaButton}


              ${cienButton}


            </div>


          </section>

        `

        : ""
    }


    <!-- =========================
      INTRO
    ========================== -->

    ${
      false

        ? `
          <section class="section">


            <span class="section-label">
              INTRO
            </span>


            <h2 class="section-title">
              導入パート
            </h2>


            <div class="intro-image-wrap">


              <img
                class="intro-main-image"
                src="${escapeHtml(
                  introMainImageUrl
                )}"
                alt=""
              >


            </div>


          </section>
        `

        : ""
    }

    <a
      class="posts-index-link"
      href="/posts"
    >
      投稿一覧に戻る
      <span aria-hidden="true">›</span>
    </a>

    <footer class="footer">

      <a href="/">
        © M2坊
      </a>
      <span aria-hidden="true">
        ·
      </span>
      <a
        class="footer-link"
        href="/privacy/"
      >
        プライバシーポリシー
      </a>
    </footer>


  </main>



  <!-- =========================
       GA4
  ========================== -->

  <script>

    document
      .querySelectorAll(
        "[data-destination]"
      )
      .forEach((link) => {


        link.addEventListener(
          "click",
          () => {


            if (
              typeof gtag
              !==
              "function"
            ) {
              return;
            }


            gtag(
              "event",
              "post_outbound_click",
              {

                post_id:
                  "${safeId}",

                destination:
                  link.dataset.destination || "",

                slot:
                  link.dataset.slot || ""

              }
            );


          }
        );


      });

  </script>


</body>

</html>`;

}



/* =========================================================
   FANBOX BLOCK
========================================================= */

function renderFanboxBlock({
  slot,
  text,
  url,
  title,
  description,
  image
}) {

  // URLがなければ表示しない
  if (!url) {
    return "";
  }


  // const safeText =
  //   escapeHtml(text || "");

  const safeUrl =
    escapeHtml(url);

  const safeTitle =
    escapeHtml(
      title ||
      "FANBOXで続きを見る"
    );

  const safeDescription =
    escapeHtml(
      description || ""
    );

  const safeImage =
    escapeHtml(image);


  return `

    <div class="continue-block">


      ${
        false

          ? `
            <p class="continue-text">
              ${safeText}
            </p>
          `

          : ""
      }


      <a

        id="fanbox-card-${escapeHtml(slot)}"

        class="fanbox-card"

        href="${safeUrl}"

        target="_blank"

        rel="noopener noreferrer"

        data-destination="fanbox"

        data-slot="${escapeHtml(slot)}"

      >


        <span class="fanbox-card__image">


          <img
            src="${safeImage}"
            alt=""
            loading="lazy"
          >


        </span>


        <span class="fanbox-card__body">


          <span class="fanbox-card__service">
            ${
              slot === "1"
                ? `
                  <span class="bounce-text">
                    <span>ま</span>
                    <span>ず</span>
                    <span>は</span>
                    <span>こ</span>
                    <span>ち</span>
                    <span>ら</span>
                    <span>！</span>
                  </span>
                `
                : "もっと見たい方はこちら！"
            }
          </span>


          <strong class="fanbox-card__title">
            ${safeTitle}
          </strong>


          ${
            safeDescription

              ? `
                <span class="fanbox-card__description">
                  ${safeDescription}
                </span>
              `

              : ""
          }


          <span class="fanbox-card__footer">


            <span>
              投稿を見る
            </span>


            <span
              class="fanbox-card__arrow"
              aria-hidden="true"
            >
              ›
            </span>


          </span>


        </span>


      </a>


    </div>

  `;

}



/* =========================================================
   SECONDARY BUTTON
========================================================= */

function secondaryButton({
  id,
  url,
  name,
  destination
}) {

  return `

    <a

      id="${escapeHtml(id)}"

      class="secondary-link"

      href="${escapeHtml(url)}"

      target="_blank"

      rel="noopener noreferrer"

      data-destination="${escapeHtml(
        destination
      )}"

      data-slot=""

    >


      <span class="secondary-link__name">

        ${escapeHtml(name)}

      </span>


      <span
        class="secondary-link__arrow"
        aria-hidden="true"
      >
        ›
      </span>


    </a>

  `;

}



/* =========================================================
   EXTERNAL URL
========================================================= */

function safeExternalUrl(
  value
) {

  if (!value) {
    return "";
  }


  try {

    const url =
      new URL(value);


    if (
      url.protocol !== "https:"
      &&
      url.protocol !== "http:"
    ) {

      return "";

    }


    return url.href;

  }

  catch {

    return "";

  }

}



/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(
  value = ""
) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}



/* =========================================================
   404
========================================================= */

function notFound() {

  return new Response(

    `<!doctype html>

<html lang="ja">

<head>

  <meta charset="utf-8">

  <meta
    name="robots"
    content="noindex"
  >

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <title>
    ページが見つかりません｜M2坊
  </title>

</head>


<body>

  <h1>
    404
  </h1>

  <p>
    ページが見つかりませんでした。
  </p>

</body>

</html>`,

    {

      status:
        404,

      headers: {

        "Content-Type":
          "text/html; charset=UTF-8"

      }

    }

  );

}