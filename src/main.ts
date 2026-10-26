import { mount } from 'svelte'
import App from './App.svelte'
import './styles/global.css'

const target = document.getElementById('app')
if (!target) throw new Error('앱을 표시할 요소를 찾지 못했습니다.')

mount(App, { target })
