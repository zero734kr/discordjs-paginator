import { DMChannel, Message, MessageEmbed, MessageReaction, NewsChannel, ReactionCollector, TextChannel, User } from "discord.js"
import { EmbedPaginator } from "./paginator"

export type PageViewType = "footer" | "author"
export type PaginationChannel = TextChannel | DMChannel | NewsChannel
export type Nullable<T> = T | null

export interface PaginatorEmojis extends Record<string, string | void> {
    prev?: string
    stop?: string
    next?: string
}

export interface PaginatorBindedMessage extends Message {
    paginator: EmbedPaginator
}

export interface PaginatorOptions {
    message: Message
    bindPageViewTo?: PageViewType
    channel?: PaginationChannel
    emojis?: PaginatorEmojis
    filterCallback(reaction: MessageReaction, user: User, emoji: string): boolean
    time?: number
}

export interface PaginationCollectors extends Record<string, unknown> {
    prev: Nullable<ReactionCollector>
    stop: Nullable<ReactionCollector>
    next: Nullable<ReactionCollector>
}

declare module "discordjs-paginator" {
    export class EmbedPaginator {
        constructor(options: PaginatorOptions)
        private instance: PaginatorBindedMessage | null
        public message: PaginatorBindedMessage
        public options: PaginatorOptions
        public currentPage: number
        public channel: PaginationChannel
        public collectors: PaginationCollectors
        public pages: MessageEmbed[]

        private validateOptions(): void
        private attachEvents(): void
        public show(page?: number): Promise<MessageEmbed>
        public addEmbed(embed: MessageEmbed): this
    }
}