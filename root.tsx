import './style/index.css'
import { ThemeInject } from "./index.client";


export function Html({ head, children }: { head: React.ReactNode, children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Requires suppressHydrationWarning on html to change attribute */}
        <ThemeInject />
        {head}
      </head>
      <body >
        {children}
      </body>
    </html>
  )
}