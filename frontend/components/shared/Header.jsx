import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
    return (
        <header className="flex items-center justify-between p-4 bg-white shadow-md">
            <div className="text-xl font-bold text-gray-900">
                Eusko Dapp
            </div>
            <div>
                <ConnectButton
                    showBalance={false}
                    chainStatus="icon"
                    accountStatus="address"
                />
            </div>
        </header>
    );
};

export default Header;
