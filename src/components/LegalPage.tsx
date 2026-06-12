import Header from "@/components/Header";
import type { LegalDoc } from "@/lib/legal";

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h2 className="mb-1 text-2xl font-bold">{doc.title}</h2>
        <p className="mb-6 text-xs text-gray-500">{doc.updated}</p>
        <div className="space-y-5 rounded-lg bg-white p-6 shadow-sm">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="mb-1 font-bold">{section.heading}</h3>
              <p className="text-sm leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
