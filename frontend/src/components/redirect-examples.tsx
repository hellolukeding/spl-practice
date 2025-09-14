import { redirect, useRouter } from 'next/navigation'
import { useEffect } from 'react'

// 1. Server Component 中的重定向 (App Router)
export function ServerRedirectExample() {
    // 在服务器组件中进行重定向
    redirect('/dashboard')

}

// 2. 条件重定向示例
export function ConditionalRedirect({ user }: { user?: any }) {
    if (!user) {
        redirect('/login')
    }

    return <div>欢迎回来，{user.name}！</div>
}

// 3. Client Component 中的重定向
'use client'
export function ClientRedirectExample() {
    const router = useRouter()

    const handleRedirect = () => {
        // 使用 push 保留历史记录
        router.push('/dashboard')

        // 或者使用 replace 替换当前历史记录
        // router.replace('/dashboard')
    }

    return (
        <button onClick={handleRedirect}>
            跳转到仪表板
        </button>
    )
}

// 4. 延迟重定向示例
'use client'
export function DelayedRedirect() {
    const router = useRouter()

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/dashboard')
        }, 3000)

        return () => clearTimeout(timer)
    }, [router])

    return <div>3秒后自动跳转到仪表板...</div>
}

// 5. 表单提交后的重定向
'use client'
export function FormWithRedirect() {
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        try {
            // 提交表单数据到API
            const response = await fetch('/api/submit', {
                method: 'POST',
                body: formData
            })

            if (response.ok) {
                // 成功后重定向
                router.push('/success')
            }
        } catch (error) {
            console.error('提交失败:', error)
        }
    }

    return (
        <form action={handleSubmit}>
            <input name="email" type="email" required />
            <button type="submit">提交</button>
        </form>
    )
}

// 6. 基于用户角色的重定向
export function RoleBasedRedirect({ user }: { user: any }) {
    if (user.role === 'admin') {
        redirect('/admin/dashboard')
    } else if (user.role === 'user') {
        redirect('/user/dashboard')
    } else {
        redirect('/login')
    }

}

// 7. 重定向到外部URL
'use client'
export function ExternalRedirect() {
    const handleExternalRedirect = () => {
        window.location.href = 'https://example.com'
    }

    return (
        <button onClick={handleExternalRedirect}>
            跳转到外部网站
        </button>
    )
}

// 8. 使用 Link 组件的 replace 属性
import Link from 'next/link'

export function LinkReplaceExample() {
    return (
        <Link href="/dashboard" replace>
            跳转到仪表板（替换历史记录）
        </Link>
    )
}
