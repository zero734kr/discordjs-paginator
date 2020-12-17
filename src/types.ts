import { DMChannel, Message, MessageReaction, NewsChannel, ReactionCollector, TextChannel, User } from "discord.js"
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
