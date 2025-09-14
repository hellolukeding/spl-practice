'use client';

import { useEffect, useState } from 'react';

interface ClientWalletWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const ClientWalletWrapper: React.FC<ClientWalletWrapperProps> = ({
    children,
    fallback = (
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
            <span className="text-sm text-gray-500">加载钱包...</span>
        </div>
    )
}) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
