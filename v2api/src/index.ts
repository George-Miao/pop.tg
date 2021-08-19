import { Application } from '@cfworker/web'
import api from './api'

new Application().use(api).listen()
