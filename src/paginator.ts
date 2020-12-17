import {
    EmojiResolvable,
    MessageEmbed, TextChannel
} from "discord.js"
import { PaginatorBindedMessage, PaginatorOptions, PaginationChannel, PaginationCollectors } from "./types"


export class EmbedPaginator {
    private instance: PaginatorBindedMessage | null
    public message: PaginatorBindedMessage
    public options: PaginatorOptions
    public currentPage: number
    public channel: PaginationChannel
    public collectors: PaginationCollectors
    public pages: MessageEmbed[]

    constructor(options: PaginatorOptions) {
        if (!options?.message) throw new Error("PaginatorOptions#message is required.")

        this.message = options.message as PaginatorBindedMessage
        this.message.paginator = this

        this.options = options
        this.options.bindPageViewTo = options.bindPageViewTo ?? void 0
        this.options.channel = options.channel ?? void 0
        this.options.time = options.time ?? 60000 * 5
        this.options.filterCallback = options.filterCallback ?? function (reaction, user, emoji) { return reaction.emoji.name === emoji && !user.bot }
        this.options.emojis = options.emojis ?? {}
        this.options.emojis.prev = options.emojis?.prev ?? "◀"
        this.options.emojis.stop = options.emojis?.stop ?? "⏹"
        this.options.emojis.next = options.emojis?.next ?? "▶"

        this.instance = null

        this.validateOptions()

        this.currentPage = 0
        this.channel = options.channel ?? this.message.channel
        
        this.collectors = {
            prev: null,
            stop: null,
            next: null
        }

        this.pages = []
    }

    private validateOptions() {
        if (this.options.channel && !(this.options.channel instanceof TextChannel)) throw new TypeError("Only DiscordJS#TextChannel instances is valid as channel")
        if (this.options.bindPageViewTo && this.options.bindPageViewTo !== "author" && this.options.bindPageViewTo !== "footer") throw new TypeError("Only 'author' and 'footer' is valid as bindPageViewTo")
        if (this.options.filterCallback && typeof this.options.filterCallback !== "function") throw new TypeError("Received options#filterCallback is not a function")
        if (typeof this.options.emojis !== "object") throw new TypeError("Only object type is allowed to options#emojis")
        if (Object.values(this.options.emojis).some((f: unknown) => typeof f !== "string")) throw new TypeError("One of emojis received from options#emojis is not a string.")
    }
 
    private attachEvents() {
        if(!this.instance) throw new Error("Cannot find message instance to attach reaction events")

        for (const key in this.collectors) {
            if(!this.options.emojis?.[key]) throw new Error("Cannot find emoji to react to message instance")

            this.instance.react(this.options.emojis[key] as EmojiResolvable)

            this.collectors[key] = this.instance.createReactionCollector((reaction, user): boolean => this.options.filterCallback(reaction, user, this.options.emojis?.[key] as string), { time: this.options.time })
        }

        this.collectors.prev?.on("collect", (reaction, user) => {
            this.instance?.reactions.cache.get(this.options.emojis?.prev as string)?.users.remove(user.id)
            if (this.currentPage === 0, !this.pages[this.currentPage - 1]) return

            this.instance?.edit(this.pages[this.currentPage - 1])
            this.currentPage -= 1
        })

        this.collectors.stop?.on("collect", () => {
            this.instance?.reactions.removeAll()
            this.collectors.prev?.stop()
            this.collectors.stop?.stop()
            this.collectors.next?.stop()
        })

        this.collectors.next?.on("collect", (reaction, user) => {
            this.instance?.reactions.cache.get(this.options.emojis?.next as string)?.users.remove(user.id)
            if (this.currentPage === (this.pages.length + 1) || !this.pages[this.currentPage + 1]) return

            this.instance?.edit(this.pages[this.currentPage + 1])
            this.currentPage += 1
        })
    }

    async show(page = 0): Promise<MessageEmbed> {
        if (typeof page !== "number") throw new TypeError(`${typeof page} is not allowed for parameter [page]`)
        if (this.pages.length <= 0) throw new RangeError("Cannot create a embed paginator because EmbedPaginator#pages is empty")
        if (page < 0) throw new RangeError("Embed Page index start at 0")
        if (!this.pages[page]) throw new RangeError(`Cannot find embed at EmbedPaginator#pages[${page}]`)

        if (!this.instance) {
            let message: PaginatorBindedMessage
            if(this.options.channel) message = await this.options.channel.send(this.pages[page]) as PaginatorBindedMessage
            else message = await this.message.edit(this.pages[page]) as PaginatorBindedMessage
            
            this.instance = message
            this.instance.paginator = this

            this.attachEvents()

            return this.pages[page]
        }

        if (this.currentPage === page) return this.pages[this.currentPage]

        await this.instance?.edit(this.pages[page])
        this.currentPage = page

        return this.pages[page]
    }

    
    addEmbed(embed: MessageEmbed): this {
        if (!(embed instanceof MessageEmbed)) throw new TypeError("Only Discord#MessageEmbed instances is valid as pages")

        this.pages.push(embed)

        return this
    }
}
