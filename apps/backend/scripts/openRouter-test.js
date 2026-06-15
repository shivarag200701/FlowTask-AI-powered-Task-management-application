"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sdk_1 = require("@openrouter/sdk");
var openRouter = new sdk_1.OpenRouter();
var result = await openRouter.chat.send({
    chatRequest: {
        model: "minimax/minimax-m2",
        messages: [{ role: "user", content: "Hello" }],
    },
});
console.log(result.choices[0].message);
