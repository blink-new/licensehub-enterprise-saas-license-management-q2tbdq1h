import { createClient } from '@blinkdotnew/sdk'

console.log('Creating Blink client...')

const blink = createClient({
  projectId: 'licensehub-enterprise-saas-license-management-q2tbdq1h',
  authRequired: true
})

console.log('LicenseHub Enterprise client created successfully:', blink)

export default blink