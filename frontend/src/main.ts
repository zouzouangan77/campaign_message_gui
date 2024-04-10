import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'

import 'primeflex/primeflex.scss'
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/aura-light-green/theme.css'
//import 'primevue/resources/themes/tailwind-light/theme.css'
import 'primevue/resources/primevue.min.css'

import './assets/flags.css'
import './assets/styles.scss'
import InputText from 'primevue/inputtext'
import Avatar from 'primevue/avatar'
import MegaMenu from 'primevue/megamenu'
import Menu from 'primevue/menu'
import Menubar from 'primevue/menubar'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import Tooltip from 'primevue/tooltip'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import Toolbar from 'primevue/toolbar'
import FileUpload from 'primevue/fileupload'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import MultiSelect from 'primevue/multiselect'
import Tag from 'primevue/tag'
import Dropdown from 'primevue/dropdown'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import PickList from 'primevue/picklist'
import Listbox from 'primevue/listbox'
import Textarea from 'primevue/textarea'
import Editor from 'primevue/editor'
import ToastService from 'primevue/toastservice'
import SplitButton from 'primevue/splitbutton'
import RadioButton from 'primevue/radiobutton'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Knob from 'primevue/knob'
import Card from 'primevue/card'
import StepperPanel from 'primevue/stepperpanel'
import Stepper from 'primevue/stepper'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.component('StepperPanel', StepperPanel)
app.component('Stepper', Stepper)
app.component('TabPanel', TabPanel)
app.component('Card', Card)
app.component('Knob', Knob)
app.component('TabView', TabView)
app.component('InputText', InputText)
app.component('SplitButton', SplitButton)
app.component('RadioButton', RadioButton)
app.component('Textarea', Textarea)
app.component('Listbox', Listbox)
app.component('Editor', Editor)
app.component('IconField', IconField)
app.component('InputIcon', InputIcon)
app.component('Tag', Tag)
app.component('Avatar', Avatar)
app.component('MegaMenu', MegaMenu)
app.component('Menu', Menu)
app.component('Menubar', Menubar)
app.component('Badge', Badge)
app.component('Button', Button)
//app.component('Tooltip', Tooltip);
app.component('Dialog', Dialog)
app.component('Toast', Toast)
app.component('Toolbar', Toolbar)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('FileUpload', FileUpload)
app.component('MultiSelect', MultiSelect)
app.component('Dropdown', Dropdown)
app.component('PickList', PickList)

app.directive('tooltip', Tooltip)
app.use(createPinia())
app.use(router)
app.use(ToastService)
app.use(PrimeVue, { ripple: true })

app.mount('#app')
