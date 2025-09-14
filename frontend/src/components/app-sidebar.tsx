"use client"

import {
    IconCamera,
    IconChartBar,
    IconCircuitCellPlus,
    IconDashboard,
    IconDatabase,
    IconFileAi,
    IconFileDescription,
    IconFileWord,
    IconFolder,
    IconHelp,
    IconListDetails,
    IconReport,
    IconSearch,
    IconSettings,
    IconUsers
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import { NavDocuments } from '@/components/nav-documents'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import { WalletButton } from '@/components/wallet-connection'

const data = {
    user: {
        name: "$Battery",
        email: "bc@battery.com",
        avatar: "/imgs/battery.png",
    },
    navMain: [
        {
            title: "仪表板",
            url: "/dashboard",
            icon: IconDashboard,
        },
        {
            title: "账单",
            url: "/billing",
            icon: IconDatabase,
        },
        {
            title: "Token 管理",
            url: "/token-setup-new",
            icon: IconSettings,
        },
        {
            title: "生命周期",
            url: "/lifecycle",
            icon: IconListDetails,
        },
        {
            title: "分析",
            url: "/analytics",
            icon: IconChartBar,
        },
        {
            title: "项目",
            url: "/projects",
            icon: IconFolder,
        },
        {
            title: "团队",
            url: "/teams",
            icon: IconUsers,
        },
    ],
    navClouds: [
        {
            title: "捕获",
            icon: IconCamera,
            isActive: true,
            url: "/capture",
            items: [
                {
                    title: "活跃提案",
                    url: "/capture/active",
                },
                {
                    title: "已归档",
                    url: "/capture/archived",
                },
            ],
        },
        {
            title: "提案",
            icon: IconFileDescription,
            url: "/proposals",
            items: [
                {
                    title: "活跃提案",
                    url: "/proposals/active",
                },
                {
                    title: "已归档",
                    url: "/proposals/archived",
                },
            ],
        },
        {
            title: "提示",
            icon: IconFileAi,
            url: "/prompts",
            items: [
                {
                    title: "活跃提案",
                    url: "/prompts/active",
                },
                {
                    title: "已归档",
                    url: "/prompts/archived",
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: "设置",
            url: "/settings",
            icon: IconSettings,
        },
        {
            title: "获取帮助",
            url: "/help",
            icon: IconHelp,
        },
        {
            title: "搜索",
            url: "/search",
            icon: IconSearch,
        },
    ],
    documents: [
        {
            name: "数据库",
            url: "/database",
            icon: IconDatabase,
        },
        {
            name: "报告",
            url: "/reports",
            icon: IconReport,
        },
        {
            name: "文字助手",
            url: "/documents",
            icon: IconFileWord,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                            isActive={pathname === "/"}
                        >
                            <Link href="/">
                                <IconCircuitCellPlus className="!size-5" />
                                <span className="text-base font-semibold">workspace</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {/* 钱包连接按钮 */}
                <div className="px-2 py-2">
                    <WalletButton />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavDocuments items={data.documents} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
