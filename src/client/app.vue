<template>
<div>
	<header class="header">
		<div>
			<button class="menu" v-if="$root.isMobile" @click="isDrawerOpening = !isDrawerOpening"><fa :icon="faBars"/></button>
			<input type="search" ref="search" v-model="query" v-if="searchMode" @keydown.enter="search()"/>
			<router-link v-else class="title" to="/">{{ wikiName }}</router-link>
			<button class="search" @click="searchMode = !searchMode"><fa :icon="faSearch"/></button>
		</div>
	</header>

	<transition name="back">
		<div class="nav-back"
			v-if="isDrawerOpening && $root.isMobile"
			@click="isDrawerOpening = false"
			@touchstart="isDrawerOpening = false"
		></div>
	</transition>
	<transition name="nav">
		<nav class="nav" v-show="isDrawerOpening">
			<router-link to="/" class="logo" v-if="$root.wiki && $root.wiki.logoUrl">
				<img :src="$root.wiki.logoUrl" :alt="wikiName"/>
			</router-link>
			<section>
				<p><fa :icon="faBars" class="icon" fixed-width/> {{ $t('menu') }}</p>
				<ul>
					<li><router-link to="/"><fa :icon="faHome" class="icon" fixed-width/><span v-t="'home'"></span></router-link></li>
					<li><router-link to="/:pages"><fa :icon="faBook" class="icon" fixed-width/><span v-t="'pages'"></span></router-link></li>
					<li><router-link to="/:files"><fa :icon="faFileImage" class="icon" fixed-width/><span v-t="'files'"></span></router-link></li>
					<li><router-link to="/:recently"><fa :icon="faHistory" class="icon" fixed-width/><span v-t="'recentlyUpdatedPages'"></span></router-link></li>
				</ul>
				<ul v-if="$root.isLoggedin">
					<li><router-link to="/:new"><fa :icon="faPlus" class="icon" fixed-width/><span v-t="'createPage'"></span></router-link></li>
					<li><router-link to="/:new-template"><fa :icon="faPlus" class="icon" fixed-width/><span v-t="'createTemplate'"></span></router-link></li>
					<li><router-link to="/:upload"><fa :icon="faUpload" class="icon" fixed-width/><span v-t="'uploadFile'"></span></router-link></li>
				</ul>
				<ul v-if="$root.user && $root.user.isAdmin">
					<li><router-link to="/:admin"><fa :icon="faCog" class="icon" fixed-width/><span v-t="'adminPage'"></span></router-link></li>
				</ul>
				<ul>
					<template v-if="$root.isLoggedin">
						<li><router-link to="/:signout"><fa :icon="faPowerOff" class="icon" fixed-width/><span v-t="'logout'"></span></router-link></li>
					</template>
					<template v-else>
						<li><router-link to="/:signin"><fa :icon="faSignInAlt" class="icon" fixed-width/><span v-t="'login'"></span></router-link></li>
						<li><router-link to="/:signup"><fa :icon="faUserPlus" class="icon" fixed-width/><span v-t="'signup'"></span></router-link></li>
					</template>
				</ul>
			</section>
			<section v-if="pinnedPages.length > 0">
				<p><fa :icon="faThumbtack" class="icon" fixed-width/> {{ $t('pinned') }}</p>
				<ul>
					<li v-for="p in pinnedPages"><router-link :to="'/' + p.path"><fa :icon="faFileAlt" class="icon" fixed-width/><span>{{ p.title }}</span></router-link></li>
				</ul>
			</section>
			<section v-if="categories.length > 0">
				<p><fa :icon="faFolderOpen" class="icon" fixed-width/> {{ $t('categories') }}</p>
				<ul>
					<li v-for="category in categories"><router-link :to="'/:categories/' + category[0]"><fa :icon="faFolder" class="icon" fixed-width/><span>{{ category[0] }}</span><small>({{ category[1].pages }})</small></router-link></li>
				</ul>
			</section>
			<section v-if="tags.length > 0">
				<p><fa :icon="faTags" class="icon" fixed-width/> {{ $t('tags') }}</p>
				<ul>
					<li v-for="tag in tags"><router-link :to="'/:tags/' + tag[0]"><fa :icon="faTag" class="icon" fixed-width/><span>{{ tag[0] }}</span><small>({{ tag[1] }})</small></router-link></li>
				</ul>
			</section>
		</nav>
	</transition>

	<main class="main">
		<router-view></router-view>
	</main>

	<footer class="footer">
		<small>Powerd by <a href="https://github.com/syuilo/kiwi">Kiwi</a><span class="ver">ver {{ version }}</span></small>
	</footer>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faHome, faPowerOff, faSignInAlt, faUserPlus, faPlus, faHistory, faUpload, faCog, faBook, faTag, faTags, faFolderOpen, faBars, faSearch, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { faFileImage, faFolder, faFileAlt } from '@fortawesome/free-regular-svg-icons';
import { version, wikiName } from './env';

export default Vue.extend({
	metaInfo: {
		titleTemplate: titleChunk => titleChunk ? `${titleChunk} - ${wikiName}` : wikiName
	},

	data() {
		return {
			wikiName,
			pinnedPages: [],
			tags: [],
			categories: [],
			searchMode: false,
			query: '',
			isDrawerOpening: !this.$root.isMobile,
			version,
			faHome, faPowerOff, faSignInAlt, faUserPlus, faPlus, faHistory, faUpload, faCog, faBook, faFileImage, faTag, faTags, faFolderOpen, faBars, faFolder, faSearch, faFileAlt, faThumbtack,
		};
	},

	watch: {
		searchMode(mode) {
			this.$nextTick(() => {
				if (mode) this.$refs.search.focus();
			});
		},

		$route() {
			this.searchMode = false;
			this.query = '';
			if (this.$root.isMobile) {
				this.isDrawerOpening = false;
			}
		}
	},

	created() {
		this.$root.api('pages/pinned').then(pages => {
			this.pinnedPages = pages;
		});

		this.$root.api('tags').then(tags => {
			this.tags = Object.entries(tags);
		});

		this.$root.api('categories-tree').then(categories => {
			this.categories = Object.entries(categories);
		});
	},

	methods: {
		search() {
			this.$router.push(`/:search/${this.query}`);
		}
	}
});
</script>

<style lang="scss">
* {
	-webkit-overflow-scrolling: touch;
}

html {
	font-family: sans-serif;
	background: #f7f7f7;
}

body {
	margin: 0;
}

a {
	color: #e05d44;
}

table.kiwi {
	width: 100%;
	max-width: 100%;
	overflow: auto;
	border-spacing: 0;
	border-collapse: collapse;
	font-size: 14px;

	thead {
		font-weight: bold;

		tr {
			th {
				text-align: left;
			}
		}
	}

	tbody {
		tr {
			&:nth-child(odd) {
				background: #fbfbfb;
			}
		}
	}

	th, td {
		padding: 8px 16px;
	}
}

#nprogress {
	$color: #ffb21f;

	pointer-events: none;

	position: absolute;
	z-index: 3000;

	.bar {
		background: $color;

		position: fixed;
		z-index: 3001;
		top: 0;
		left: 0;

		width: 100%;
		height: 2px;
	}

	/* Fancy blur effect */
	.peg {
		display: block;
		position: absolute;
		right: 0;
		width: 100px;
		height: 100%;
		box-shadow: 0 0 10px $color, 0 0 5px $color;
		opacity: 1;

		transform: rotate(3deg) translate(0px, -4px);
	}
}
</style>

<style lang="scss" scoped>
@import './style.scss';

$header-height: 50px;
$nav-width: 250px;
$content-width: 900px;

.header {
	position: fixed;
	z-index: 2000;
	top: 0;
	left: 0;
	width: 100%;
	line-height: $header-height;
	box-shadow: rgba(0, 0, 0, 0.2) 0 0 8px;
	background: #a9b979;

	> div {
		max-width: $nav-width + $content-width;
		position: relative;

		> .title {
			padding: 0 16px;
			color: #fff;
			font-weight: bold;
			text-decoration: none;
		}

		> input {
			margin: 0 16px;
		}

		> .menu, > .search {
			width: $header-height;
			height: $header-height;
			appearance: none;
			-webkit-appearance: none;
			background: transparent;
			border: none;
			cursor: pointer;
			color: #fff;
		}

		> .search {
			position: absolute;
			top: 0;
			right: 0;
		}
	}
}

.nav-back {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1000;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.2);
}

.nav {
	position: fixed;
	z-index: 1001;
	top: $header-height;
	left: 0;
	width: $nav-width;
	height: calc(100% - #{$header-height});
	overflow: auto;
	background: #353432;
	font-size: 14px;

	> .logo {
		display: block;

		> img {
			display: block;
			max-width: 100%;
		}
	}

	> section {
		> p {
			margin: 0;
			padding: 8px 16px;
			background: #484641;
			color: #9e9e9e;
		}

		> ul {
			margin: 12px 0;
			padding: 0;
			list-style: none;

			> li {
				margin: 0;

				> a {
					display: block;
					padding: 4px 16px;
					color: #ccc;
					text-decoration: none;

					&:hover {
						color: #fff;
					}

					> .icon {
						opacity: 0.7;
						margin-right: 6px;
						color: #bcbd88;
					}

					> small {
						margin-left: 6px;
						font-size: 100%;
						opacity: 0.5;
					}
				}
			}
		}
	}
}

.main {
	margin: $header-height 0 0 $nav-width;
	max-width: $content-width;

	@include mobile {
		margin: $header-height 0 0 0;
	}
}

.footer {
	margin: 0 0 0 $nav-width;
	padding: 32px;
	background: #eee;

	@include mobile {
		margin: 0 0 0 0;
	}

	> small {
		opacity: 0.6;

		> a {
			color: inherit;
		}

		> .ver {
			margin-left: 16px;
		}
	}
}

// Transitions

.nav-enter-active,
.nav-leave-active {
	opacity: 1;
	transform: translateX(0);
	transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.nav-enter,
.nav-leave-active {
	opacity: 0;
	transform: translateX(-240px);
}

.back-enter-active,
.back-leave-active {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.back-enter,
.back-leave-active {
	opacity: 0;
}
</style>
