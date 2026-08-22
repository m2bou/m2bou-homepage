import { onRequestGet as postHandler } from "./functions/posts/[id].js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 動作確認用
    if (url.pathname === "/test") {
      return new Response("Workers routing OK");
    }

    // /posts/12345678
    const postMatch =
      url.pathname.match(/^\/posts\/(\d+)\/?$/);

    if (postMatch) {
      return postHandler({
        request,
        env,
        params: {
          id: postMatch[1]
        },
        waitUntil: ctx.waitUntil.bind(ctx),
        passThroughOnException() {}
      });
    }

    // それ以外は既存の静的サイト
    return env.ASSETS.fetch(request);
  }
};