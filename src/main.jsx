import { render } from 'preact'
import App from './App.jsx'
import './styles/base.css'
import './styles/layout.css'
import './styles/tree.css'
import './styles/panel.css'
import './styles/modals.css'
import { initGlobalTooltip } from './lib/globalTooltip.js'

initGlobalTooltip()
render(<App />, document.getElementById('app'))
