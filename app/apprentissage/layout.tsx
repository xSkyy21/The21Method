import { Header } from "@/components/header"

export default function ApprentissageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}
