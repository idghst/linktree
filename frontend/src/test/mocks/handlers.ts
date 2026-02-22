import { http, HttpResponse } from 'msw'

const mockUser = {
  id: '00000000-0000-0000-0000-000000000001',
  username: 'testuser',
  email: 'test@example.com',
  displayName: 'Test User',
  bio: null,
  avatarUrl: null,
  theme: 'default',
  bgColor: '#ffffff',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockToken = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  tokenType: 'bearer',
}

const mockLink = {
  id: '00000000-0000-0000-0000-000000000002',
  userId: '00000000-0000-0000-0000-000000000001',
  title: 'Test Link',
  url: 'https://example.com',
  description: null,
  thumbnailUrl: null,
  faviconUrl: null,
  position: 0,
  isActive: true,
  clickCount: 0,
  scheduledStart: null,
  scheduledEnd: null,
  isSensitive: false,
  linkType: 'link',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const handlers = [
  http.post('/graphql', async ({ request }) => {
    const body = await request.json() as { query: string; variables?: Record<string, unknown> }
    const query = body.query || ''

    // Auth mutations
    if (query.includes('mutation Register')) {
      return HttpResponse.json({ data: { register: mockUser } })
    }
    if (query.includes('mutation Login')) {
      return HttpResponse.json({ data: { login: mockToken } })
    }
    if (query.includes('mutation RefreshToken')) {
      return HttpResponse.json({
        data: {
          refreshToken: {
            accessToken: 'new-mock-access-token',
            refreshToken: 'new-mock-refresh-token',
            tokenType: 'bearer',
          },
        },
      })
    }
    if (query.includes('mutation ChangePassword')) {
      return HttpResponse.json({ data: { changePassword: true } })
    }
    if (query.includes('mutation DeleteAccount')) {
      return HttpResponse.json({ data: { deleteAccount: true } })
    }

    // Auth queries
    if (query.includes('query Me') || (query.includes('me {') && !query.includes('mutation'))) {
      return HttpResponse.json({ data: { me: mockUser } })
    }

    // Links mutations
    if (query.includes('mutation CreateLink')) {
      const input = body.variables?.input as Record<string, unknown>
      return HttpResponse.json({
        data: {
          createLink: {
            ...mockLink,
            title: input?.title ?? mockLink.title,
            url: input?.url ?? mockLink.url,
          },
        },
      })
    }
    if (query.includes('mutation UpdateLink')) {
      const input = body.variables?.input as Record<string, unknown>
      return HttpResponse.json({ data: { updateLink: { ...mockLink, ...input } } })
    }
    if (query.includes('mutation DeleteLink')) {
      return HttpResponse.json({ data: { deleteLink: true } })
    }
    if (query.includes('mutation ReorderLinks')) {
      return HttpResponse.json({ data: { reorderLinks: [] } })
    }
    if (query.includes('mutation ToggleLink')) {
      return HttpResponse.json({ data: { toggleLink: mockLink } })
    }

    // Links queries
    if (query.includes('query Links')) {
      return HttpResponse.json({ data: { links: [] } })
    }

    // Profile mutations
    if (query.includes('mutation UpdateProfile')) {
      const input = body.variables?.input as Record<string, unknown>
      return HttpResponse.json({ data: { updateProfile: { ...mockUser, ...input } } })
    }

    // Profile queries
    if (query.includes('query MyProfile') || query.includes('myProfile {')) {
      return HttpResponse.json({ data: { myProfile: mockUser } })
    }

    // Analytics queries
    if (query.includes('query Summary') || query.includes('summary {')) {
      return HttpResponse.json({
        data: {
          summary: {
            totalClicks: 0,
            totalViews: 0,
            totalLinks: 0,
            todayClicks: 0,
            todayViews: 0,
            clickThroughRate: 0,
          },
        },
      })
    }
    if (query.includes('query LinkStats') || query.includes('linkStats {')) {
      return HttpResponse.json({ data: { linkStats: [] } })
    }
    if (query.includes('query ViewStats') || query.includes('viewStats')) {
      return HttpResponse.json({
        data: { viewStats: { days: 7, totalViews: 0, daily: [] } },
      })
    }
    if (query.includes('query TopLinks') || query.includes('topLinks')) {
      return HttpResponse.json({ data: { topLinks: [] } })
    }
    if (query.includes('query RecentClicks') || query.includes('recentClicks')) {
      return HttpResponse.json({ data: { recentClicks: [] } })
    }

    return HttpResponse.json({ data: null })
  }),

  // REST 유지 - 공개 프로필 및 view 기록
  http.get('/api/public/:username', ({ params }) => {
    return HttpResponse.json({
      username: params.username,
      display_name: 'Test User',
      bio: null,
      avatar_url: null,
      theme: 'default',
      bg_color: '#ffffff',
      social_links: null,
      seo_settings: null,
      links: [],
    })
  }),

  http.post('/api/public/:username/view', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
