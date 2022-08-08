# Tolley's Simple JSON Logger - Node.JS

TSJL is a logger, that logs JSON, and is simple to use; hence the name.

It outputs a JSON object that looks like this in the logfile:

```json
{
    "date": "2021-10-08T11:50:10.674Z",
    "level": "info",
    "appName": "discord-bot",
    "subprocess": "mongodb-handler",
    "message":"Connected to Server!",
    "extra": {
        "ip": "127.0.0.1",
        "user":"tolley"
        }
    }
```

but like this in the console

```
[2021-10-08 12:50:10 GMT+01] [discord-bot.mongodb-handler] [Info] Connected to Server!
```

Options:

```js
let logger = new tsjl.Logger("foo", "bar", {
    //idk
    stdout: {
        enable: false
    },
    //webhook link where to send an embed, container the logged information
    webhook: {
        url: "https://discord.com/api/webhooks/123456789/abcdefghilmnopqrstvz" 
    }
    //idk
    file: [
        {
            enable: true,
            json: false,
            path: "./human.log"
        }
    ]
});
```

## [Docs](https://docs.tolley.dev/books/node/page/intro)
