import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import "dotenv/config";

const ratelimit = new Ratelimit({
  redis: new Redis({
    url: "https://live-seal-15865.upstash.io",
    token: process.env.UPSTASH_TOKEN,
  }),
  limiter: Ratelimit.slidingWindow(100, "60 s"),
});

export default ratelimit;
