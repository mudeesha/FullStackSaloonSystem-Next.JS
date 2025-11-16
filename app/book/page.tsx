// app/book/page.tsx
import { Suspense } from "react"
import BookPageContent from "./BookPageContent"

export default function BookPage() {
  return (
    <Suspense fallback={<BookPageLoading />}>
      <BookPageContent />
    </Suspense>
  )
}

function BookPageLoading() {
  return (
    <div>Loading booking page...</div>
  )
}