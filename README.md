<h1 align="center">DiscordJS Embed Paginator</h1>
<p>
  <a href="https://www.npmjs.com/package/discordjs-paginator" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/discordjs-paginator.svg">
  </a>
  <a href="https://github.com/zero734kr/discordjs-paginator#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/zero734kr/discordjs-paginator/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/zero734kr/discordjs-paginator/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/zero734kr/discordjs-paginator" />
  </a>
  <a href="https://npmcharts.com/compare/discordjs-paginator?minimal=true" target="_blank">
    <img alt="Downloads" src="https://img.shields.io/npm/dm/discordjs-paginator.svg">
  </a>
</p>

> Embed Paginator to use easy and fastly with discord.js

## Install

```sh
# NPM
$ npm install discordjs-paginator
# Yarn
$ yarn add discordjs-paginator
```

## Options

### EmbedPaginator

| Option           | Type                                                                                | Required | Default                                       | Description                                                          |
|------------------|-------------------------------------------------------------------------------------|----------|-----------------------------------------------|----------------------------------------------------------------------|
| `message`        | [Message](https://discord.js.org/#/docs/main/master/class/Message)                  |    O     |                                               | The message instance to be binded with paginator                     |
| `bindPageViewTo` | string (only "footer" and "author" allowed)                                         |    x     |   void                                        | Location to bind page view like `Page: 1 / 3`                        |
| `channel`        | [TextChannel](https://discord.js.org/#/docs/main/stable/class/TextChannel)          |    x     |   void                                        | Overrides the `message` option                                       |
| `emojis.prev`    | string                                                                              |    x     |    ◀                                          | The emoji used for previous button                                   |
| `emojis.stop`    | string                                                                              |    x     |    ⏹                                         | The emoji used for stop button                                       |
| `emojis.next`    | string                                                                              |    x     |    ▶                                          | The emoji used for next button                                       |
| `filterCallback` | function: boolean                                                                   |    x     | ``(r, u, e) => r.emoji.name === e && !u.bot`` | Callback function to filter reactions                                |
| `time`           | number                                                                              |    x     |   360000                                      | Timeout to destroy reaction collectors                               |
| `pageView`       | string                                                                              |    x     | ``"Page: {CURRENT_PAGE} / {TOTAL_PAGE}"``     | Page view text to be binded (only work with `bindPageViewTo` option) |


## Usage

If you want to see usage more quickly, [click](https://github.com/zero734kr/discordjs-paginator#quick-usage)

```js
const { EmbedPaginator } = require("discordjs-paginator")
const { Client, Collection, MessageEmbed } = require("discord.js")
const client = new Client()
const PREFIX = "!"

client.storage = new Collection()
client.deploys = new Collection()

client.on("ready", () => console.log(`Ready as ${client.user.tag}`))

client.on("message", async message => {
    if (
        message.author.bot
        || message.channel.type === "dm"
        || message.system
        || !message.content.startsWith(PREFIX)
    ) return

    const args = message.content.slice(PREFIX.length).trim().split(/ +/gi)
    const command = args.shift().toLowerCase()

    if (command === "embed") {
        const subcommand = args.shift().toLowerCase()

        if (subcommand === "add") {
            const embed = new MessageEmbed().setDescription(args.join(" "))

            const cache = client.storage.get(message.author.id)
            if (cache) client.storage.set(message.author.id, [...cache, embed])
            else client.storage.set(message.author.id, [embed])

            return message.reply("added")
        }
        if (subcommand === "remove") {
            const index = parseInt(args[0]) - 1

            const cache = client.storage.get(message.author.id)
            if (!cache) return message.reply("couldn't find embed to remove, empty storage")
            if (!cache[index]) return message.reply(`index ${index} out of range(length: ${cache.length})`)

            client.storage.set(message.author.id, cache.filter((f, i) => i !== index))
            return message.reply("removed")
        }
        if (subcommand === "deploy") {
            const cache = client.storage.get(message.author.id)
            const msgResolvable = args[0]

            if (!cache) return message.reply("couldn't find embeds to show")
            if (!msgResolvable) return message.reply(`Usage: \`\`${PREFIX}embed deploy <msg ID>\`\``)

            const deploy = new EmbedPaginator({
                message: await message.channel.messages.fetch(msgResolvable),
                bindPageViewTo: "footer",
                pageView: "Page {CURRENT_PAGE} of {TOTAL_PAGE}"
            })

            for (const embed of cache) deploy.addEmbed(embed)

            deploy.show()

            client.deploys.set(message.author.id, deploy)
            return message.reply("deployed")
        }
        if (subcommand === "clear") {
            client.storage.delete(message.author.id)
            client.deploys.delete(message.author.id)
            return message.reply("forcibly removed embed storage")
        }
    }
})

client.login("super secret token")
```

### Quick Usage

```js
new EmbedPaginator({
  message: await message.channel.messages.fetch(msgResolvable),
  bindPageViewTo: "footer",
  pageView: "Page {CURRENT_PAGE} of {TOTAL_PAGE}"
})
```

## Author

👤 **zero734kr**

* Personal Github: [@zero734kr](https://github.com/zero734kr)


## 🤝 Contribuiting

Issues and Pull Requests are welcome!<br>
If you had a problem please contact at [issues page](https://github.com/zero734kr/discordjs-paginator/issues)<br>
Code Change Requests are available to open pulls at [PR page](https://github.com/zero734kr/discordjs-paginator/pulls).


## Support

If this library was useful please star⭐️ this repo


## 📝 License

Copyright © 2020 [zero734kr](https://github.com/zero734kr).<br />
This project is [MIT](https://github.com/zero734kr/discordjs-paginator/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
