import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

const NotConnected = () => {
    return (
        <Alert variant="destructive" className="w-full text-center">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
                Merci de vous connecter avant de poursuivre
            </AlertDescription>
        </Alert>
    )
}

export default NotConnected