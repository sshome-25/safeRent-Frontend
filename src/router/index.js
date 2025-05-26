import { createRouter, createWebHistory } from 'vue-router'

import LandingPage from '@/pages/landing/index.vue'
import DiagnosisPage from '@/pages/diagnosis/index.vue'
import MapPage from '@/pages/map/index.vue'
import CommunityPage from '@/pages/community/index.vue'
import PostDetailPage from '@/pages/community/PostDetailPage.vue'
import LoginPage from '@/pages/login/index.vue'
import SignupPage from '@/pages/signup/index.vue'
import MyPage from '@/pages/mypage/index.vue'

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			name: 'landing',
			component: LandingPage,
		},
		{
			path: '/diagnosis/:analysis_id?',
			name: 'diagnosis',
			component: DiagnosisPage,
			props: true,
		},
		{
			path: '/map',
			name: 'map',
			component: MapPage,
		},
		{
			path: '/community',
			name: 'community',
			component: CommunityPage,
		},
		{
			path: '/postDetail/:post_id',
			name: 'postDetail',
			component: PostDetailPage,
		},
		{
			path: '/login',
			name: 'login',
			component: LoginPage,
		},
		{
			path: '/signup',
			name: 'signup',
			component: SignupPage,
		},
		{
			path: '/mypage',
			name: 'mypage',
			component: MyPage,
		},
	],
	scrollBehavior(to, from, savedPosition) {
		// 항상 페이지 이동 시 최상단으로 이동
		return { top: 0 }
	},
})

export default router
