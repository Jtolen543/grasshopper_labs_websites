export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="text-muted-foreground mb-4">
        Have questions or feedback? We’d love to hear from you!
      </p>
      <a
        href="mailto:support@resumehub.com"
        className="text-primary hover:underline"
      >
        support@resumehub.com
      </a>
    </div>
  )
}
