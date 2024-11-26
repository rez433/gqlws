import { useState } from 'react'
import { ApolloClient, InMemoryCache, ApolloProvider, useSubscription, useMutation, gql } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { split, HttpLink } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'

const httpLink = new HttpLink({
	uri: 'http://localhost:4000/graphql',
})

const wsLink = new GraphQLWsLink(
	createClient({
		url: 'ws://localhost:4000/graphql',
	})
)

const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query)
		return (
			definition.kind === 'OperationDefinition' &&
			definition.operation === 'subscription'
		)
	},
	wsLink as any,
	httpLink
)

const client = new ApolloClient({
	link: splitLink,
	cache: new InMemoryCache(),
})

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      text
      sender
    }
  }
`

const SEND_MESSAGE = gql`
  mutation SendMessage($sender: String!, $text: String!) {
    sendMessage(sender: $sender, text: $text) {
      id
      text
      sender
    }
  }
`

const Messages = ({ sender }: { sender: string }) => {
	const { data } = useSubscription(GET_MESSAGES)

	if (!data) {
		return null
	}

	return (
		<div className='rotate-180 msg-container'>
			{data.messages.map(
				({ id, sender: messageSender, text }: { id: number; sender: string; text: string }) => (
					<div key={id} className="pr-4 scroll-target" style={{
						display: 'flex',
						marginBottom: '1em',
						justifyContent: sender === messageSender ? 'flex-start' : 'flex-end',
					}}>
						<div className='flex flex-row gap-2 align-center'>
						<span className='mt-6'
								style={{
									color: '#838385',
									display: sender !== messageSender ? 'block' : 'none',
								}}
							>
								{new Intl.DateTimeFormat('en-GB', { timeStyle: 'short', hourCycle: 'h23' }).format(new Date(id))}
							</span>
							<span style={{
								background: sender === messageSender ? 'blue' : '#e5e6ea',
								color: sender === messageSender ? 'white' : 'black',
								padding: '1em',
								borderRadius: '1em',
							}}>
								{text}
							</span>
							<span className='mt-6'
								style={{
									color: '#838385',
									display: sender === messageSender ? 'block' : 'none',
								}}
							>
								{new Intl.DateTimeFormat('en-GB', { timeStyle: 'short', hourCycle: 'h23' }).format(new Date(id))}
							</span>
						</div>
						{sender !== messageSender && (
							<div
								style={{
									height: 50,
									width: 50,
									marginRight: '0.5em',
									border: '2px solid #646cff',
									borderRadius: 25,
									textAlign: 'center',
									fontSize: '18pt',
									paddingTop: 5,
								}}
							>
								{messageSender.slice(0, 2).toUpperCase()}
							</div>
						)}
					</div>
				)
			)}
		</div>
	)
}

const Chat = () => {
	const [input, setInput] = useState({ sender: 'John Doe', text: '' })
	const [sendMessage] = useMutation(SEND_MESSAGE)

	const handleSend = () => {
		if (input.text.length > 0) {
			sendMessage({ variables: input })
		}
		setInput({ ...input, text: '' })
	}

	return (
		<div className="w-full p-4">
			<div className='msgs'>
				<Messages sender={input.sender} />
			</div>
			<div className="flex p-2 nput bottom-0 left-0">
				<div className="basis-1/4 p-0">
					<input
						id="sender"
						type="text"
						value={input.sender}
						onChange={(e) =>
							setInput({
								...input,
								sender: e.target.value,
							})
						}
						className="w-full p-2 border border-gray-400 rounded"
					/>
				</div>
				<div className="basis-2/4 p-0">
					<input
						id="message"
						type="text"
						value={input.text}
						onChange={(e) =>
							setInput({
								...input,
								text: e.target.value,
							})
						}
						onKeyUp={(e) => {
							if (e.key === 'Enter') {
								handleSend()
							}
						}}
						className="w-full p-2 border border-gray-400 rounded"
					/>
				</div>
				<div className="basis-1/4 pl-4">
					<button
						onClick={handleSend}
						className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					>
						Send
					</button>
				</div>
			</div>
		</div>
	)
}

export default () => (
	<ApolloProvider client={client}>
		<Chat />
	</ApolloProvider>
)

