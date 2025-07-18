import { JSX } from 'solid-js'
import { NoHydration } from 'solid-js/web'
import { Body, Button, Column, Container, Html, Row, Section, Text } from 'solid-jsx-email'

const mainStyle = {
	'font-family': '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
	'background-color': '#ffffff',
	margin: '0 auto'
} satisfies JSX.CSSProperties

const textStyle = {
	color: '#777',
	'font-size': '16px',
	'line-height': '24px',
	'text-align': 'left'
} satisfies JSX.CSSProperties

export default function TestEmail2() {
	return (
		<NoHydration>
			<Html lang="en">
				<Body style={mainStyle}>
					<Section>
						<Container>
							<Row>
								<Column>
									<Text style={textStyle}>Hello 2</Text>
								</Column>
								<Column>
									<Text style={textStyle}>This is me 2</Text>
								</Column>
							</Row>
						</Container>
					</Section>
					<Section></Section>
					<Section>
						<Container>
							<Button
								href="https://example.com"
								width={160}
								height={60}
								target="_blank"
								textColor={'#fff'}
								align="center"
								backgroundColor={'#777'}
								borderRadius={5}
								fontSize={16}
							>
								Click me
							</Button>
						</Container>
					</Section>
					<Section>
						<Container>
							<Text style={{ 'text-align': 'center' }}>This is paragraph 2</Text>
						</Container>
					</Section>
				</Body>
			</Html>
		</NoHydration>
	)
}
