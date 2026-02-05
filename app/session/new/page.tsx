import { SessionWizard } from "@/components/session/session-wizard"

export default function NewSessionPage() {
    return (
        <div className="container max-w-lg py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-center">New Parking Session</h1>
            <SessionWizard />
        </div>
    )
}
