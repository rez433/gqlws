import { createSchema, createYoga, createPubSub } from 'graphql-yoga'

interface Message {
	id: number
	text: string
	sender: string
}

const messages: Message[] = []
const subscribers: any[] = []
const onMessagesUpdate = (fn: () => void) => subscribers.push(fn)

const pubSub = createPubSub()

const typeDefs = /* GraphQL */ `
	type Message {
		id: Float
		text: String
		sender: String
	}

	type Query {
		messages: [Message]
	}

	type Mutation {
		sendMessage(text: String!, sender: String!): Message
	}

	type Subscription {
		newMessage: Message
		messages: [Message]
	}
`

const resolvers = {
	Query: {
		messages: () => messages,
	},
	Mutation: {
		sendMessage: (parent: any, args: any, context: any, info: any) => {
			const message: Message = {
				id: Date.now(),
				text: args.text,
				sender: args.sender,
			}

			messages.push(message)

			subscribers.forEach((fn) => fn())
			return message
		},
	},
	Subscription: {
		newMessage: {
			subscribe: () => pubSub.subscribe('newMessage'),
			resolve: (payload: Message) => payload,
		},
		messages: {
			subscribe: () => {
				const channel = Date.now().toString()
				onMessagesUpdate(() => {
					pubSub.publish(channel, { messages })
				})
				return pubSub.subscribe(channel)
			},
			resolve: (payload: { messages: Message[] }) => payload.messages,
		},
	},
}

export const schema = createSchema({
	typeDefs,
	resolvers,
})

export default createYoga({
	schema,
})
