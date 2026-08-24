const MAX_POSTS = 100;


export async function onRequestGet(context) {

  const { env, request } = context;


  if (!env.POSTS) {

    return new Response(
      "POSTS KV binding is missing",
      {
        status: 500
      }
    );

  }


  // ========================================
  // KVのキー一覧を取得
  // ========================================

  let result;

  try {

    result =
      await env.POSTS.list({
        limit: MAX_POSTS
      });

  }

  catch (error) {

    console.error(
      "Failed to list POSTS KV:",
      error
    );

    return new Response(
      "Failed to load posts",
      {
        status: 500
      }
    );

  }


  // 数字のキーだけ投稿として扱う
  const keys =
    result.keys.filter(
      (item) =>
        /^\d+$/.test(item.name)
    );


  // ========================================
  // 各投稿データを取得
  // ========================================

  const posts =
    (
      await Promise.all(

        keys.map(
          async (item) => {

            try {

              const raw =
                await env.POSTS.get(
                  item.name
                );


              if (!raw) {
                return null;
              }


              const post =
                JSON.parse(raw);


              return {

                id:
                  item.name,

                title:
                  post.title ||
                  `投稿 ${item.name}`,

                publishedAt:
                  post.published_at ||
                  "",

                description:
                  post.description ||
                  ""

              };

            }

            catch (error) {

              console.error(
                `Failed to load post ${item.name}:`,
                error
              );

              return null;

            }

          }
        )

      )
    )
      .filter(Boolean);


  // ========================================
  // 新しい日付順
  // ========================================

  posts.sort(
    (a, b) => {

      if (
        a.publishedAt !==
        b.publishedAt
      ) {

        return b.publishedAt.localeCompare(
          a.publishedAt
        );

      }


      return b.id.localeCompare(
        a.id,
        undefined,
        {
          numeric: true
        }
      );

    }
  );


  const url =
    new URL(request.url);


  const canonicalUrl =
    `${url.origin}/posts`;


  const ogpImageUrl =
    new URL(
      "/assets/images/ogp-hero.webp",
      url.origin
    ).href;


  const html =
    renderPage({
      posts,
      canonicalUrl,
      ogpImageUrl
    });


  return new Response(
    html,
    {

      status: 200,

      headers: {

        "Content-Type":
          "text/html; charset=UTF-8",

        "Cache-Control":
          "public, max-age=300"

      }

    }
  );

}



/* =========================================================
   PAGE
========================================================= */

function renderPage({
  posts,
  canonicalUrl,
  ogpImageUrl
}) {

  const postListHtml =
    posts.length

      ? posts
          .map(
            (post) =>
              renderPostCard(post)
          )
          .join("")

      : `

        <div class="empty">

          まだ投稿がありません。

        </div>

      `;


  return `<!doctype html>

<html lang="ja">

<head>

  <meta charset="utf-8">


  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >


  <title>
    投稿一覧｜M2坊
  </title>


  <meta
    name="description"
    content="M2坊の投稿一覧です。"
  >


  <link
    rel="canonical"
    href="${escapeHtml(canonicalUrl)}"
  >


  <link
    rel="icon"
    href="/assets/images/favicon.ico"
  >


  <!-- OGP -->

  <meta
    property="og:type"
    content="website"
  >

  <meta
    property="og:site_name"
    content="M2坊"
  >

  <meta
    property="og:title"
    content="投稿一覧｜M2坊"
  >

  <meta
    property="og:description"
    content="M2坊の投稿一覧です。"
  >

  <meta
    property="og:url"
    content="${escapeHtml(canonicalUrl)}"
  >

  <meta
    property="og:image"
    content="${escapeHtml(ogpImageUrl)}"
  >

  <meta
    property="og:locale"
    content="ja_JP"
  >


  <!-- X -->

  <meta
    name="twitter:card"
    content="summary_large_image"
  >

  <meta
    name="twitter:title"
    content="投稿一覧｜M2坊"
  >

  <meta
    name="twitter:description"
    content="M2坊の投稿一覧です。"
  >

  <meta
    name="twitter:image"
    content="${escapeHtml(ogpImageUrl)}"
  >


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
        620px;

    }


    * {
      box-sizing: border-box;
    }


    html {
      background: var(--bg);
    }


    body {

      margin: 0;

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
        1.6;

    }


    img {

      display:
        block;

      max-width:
        100%;

    }


    a {
      color: inherit;
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
       HEADER
    ========================== */

    .brand {

      margin-bottom:
        28px;

      font-size:
        14px;

      font-weight:
        800;

    }

    .brand a {
        color: inherit;
        text-decoration: none;
    }


    .page-label {

      margin:
        0 0 5px;

      color:
        var(--accent);

      font-size:
        9px;

      font-weight:
        900;

      letter-spacing:
        .12em;

    }


    h1 {

      margin:
        0 0 28px;

      font-size:
        clamp(
          24px,
          7vw,
          32px
        );

      line-height:
        1.35;

      letter-spacing:
        -.02em;

    }


    /* =========================
       POST LIST
    ========================== */

    .post-list {

      display:
        grid;

      gap:
        10px;

    }


    .post-link {

      display:
        grid;

      grid-template-columns:
        116px
        minmax(0, 1fr)
        24px;

      align-items:
        center;

      min-height:
        92px;

      overflow:
        hidden;

      background:
        var(--surface);

      border:
        1px solid var(--line);

      border-radius:
        16px;

      text-decoration:
        none;

      transition:
        transform .15s ease,
        border-color .15s ease,
        box-shadow .15s ease;

    }


    .post-image {

      width:
        116px;

      height:
        92px;

      overflow:
        hidden;

      background:
        #eeeae4;

      border-right:
        1px solid var(--line);

    }


    .post-image img {

      width:
        100%;

      height:
        100%;

      object-fit:
        cover;

    }


    .post-body {

      min-width:
        0;

      padding:
        12px 14px;

    }


    .post-date {

      margin:
        0 0 3px;

      color:
        var(--muted);

      font-size:
        9px;

    }


    .post-title {

      display:
        -webkit-box;

      overflow:
        hidden;

      margin:
        0;

      font-size:
        14px;

      font-weight:
        800;

      line-height:
        1.5;

      -webkit-line-clamp:
        2;

      -webkit-box-orient:
        vertical;

    }


    .post-description {

        display:
            -webkit-box;

        overflow:
            hidden;

        margin-top:
            5px;

        color:
            var(--muted);

        font-size:
            9px;

        line-height:
            1.5;

        -webkit-line-clamp:
            2;

        -webkit-box-orient:
            vertical;

    }


    .post-arrow {

      padding-right:
        12px;

      color:
        #aaa39b;

      font-size:
        20px;

      text-align:
        center;

    }


    .empty {

      padding:
        40px 20px;

      background:
        var(--surface);

      border:
        1px solid var(--line);

      border-radius:
        16px;

      color:
        var(--muted);

      font-size:
        12px;

      text-align:
        center;

    }


    /* =========================
       FOOTER
    ========================== */

    .footer {

      padding-top:
        36px;

      color:
        #aaa39b;

      font-size:
        9px;

      text-align:
        center;

    }

    
    .footer a {
      color: inherit;
      text-decoration: none;
    }


    @media (hover: hover) {

      .post-link:hover {

        transform:
          translateY(-1px);

        border-color:
          #d9d3cc;

        box-shadow:
          0 7px 22px
          rgba(40, 34, 28, .07);

      }

    }


    @media (max-width: 390px) {

      main {

        width:
          calc(100% - 20px);

      }


      .post-link {

        grid-template-columns:
          96px
          minmax(0, 1fr)
          20px;

      }


      .post-image {

        width:
          96px;

        height:
          86px;

      }


      .post-body {

        padding:
          10px 12px;

      }

    }

  </style>

</head>


<body>


  <main>


    <div class="brand">
      M2坊
    </div>


    <div class="page-label">
      POSTS
    </div>


    <h1>
      投稿一覧
    </h1>


    <div class="post-list">

      ${postListHtml}

    </div>


    <footer class="footer">
      <a href="/">
        © M2坊
      </a>
    </footer>


  </main>


</body>

</html>`;

}



/* =========================================================
   POST CARD
========================================================= */

function renderPostCard(post) {

  const safeId =
    escapeHtml(post.id);

  const safeTitle =
    escapeHtml(post.title);

  const safeDate =
    escapeHtml(post.publishedAt);

  const safeDescription =
    escapeHtml(post.description);


  const imageUrl =
    `/assets/images/posts/${encodeURIComponent(
      post.id
    )}/ogp.webp`;


  return `

    <a
      class="post-link"
      href="/posts/${encodeURIComponent(
        post.id
      )}"
    >


      <div class="post-image">

        <img
          src="${imageUrl}"
          alt=""
          loading="lazy"
        >

      </div>


      <div class="post-body">

        ${
          safeDate

            ? `
              <div class="post-date">
                ${safeDate}
              </div>
            `

            : ""
        }


        <div class="post-title">
          ${safeTitle}
        </div>


        ${
        safeDescription

            ? `
            <div class="post-description">
                ${safeDescription}
            </div>
            `

            : ""
        }

      </div>


      <div
        class="post-arrow"
        aria-hidden="true"
      >
        ›
      </div>


    </a>

  `;

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