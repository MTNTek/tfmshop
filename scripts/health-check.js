// Health check script for production monitoring
const http = require('http')
const https = require('https')

const healthCheck = {
  // Check application health
  async checkApp(url = 'http://localhost:3001') {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http
      
      const req = client.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve({
            status: 'healthy',
            statusCode: res.statusCode,
            responseTime: Date.now() - startTime,
          })
        } else {
          reject({
            status: 'unhealthy',
            statusCode: res.statusCode,
            error: `HTTP ${res.statusCode}`,
          })
        }
      })

      const startTime = Date.now()
      
      req.on('error', (error) => {
        reject({
          status: 'unhealthy',
          error: error.message,
          responseTime: Date.now() - startTime,
        })
      })

      req.setTimeout(5000, () => {
        req.destroy()
        reject({
          status: 'unhealthy',
          error: 'Request timeout',
          responseTime: 5000,
        })
      })
    })
  },

  // Check database connectivity
  async checkDatabase() {
    try {
      // This would be your actual database connection
      // For now, return a mock response
      return {
        status: 'healthy',
        responseTime: 50,
        connections: 5,
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      }
    }
  },

  // Check external services
  async checkExternalServices() {
    const services = [
      { name: 'Unsplash API', url: 'https://api.unsplash.com' },
      // Add more external services as needed
    ]

    const results = await Promise.allSettled(
      services.map(async (service) => {
        try {
          const result = await this.checkApp(service.url)
          return { name: service.name, ...result }
        } catch (error) {
          return { name: service.name, ...error }
        }
      })
    )

    return results.map((result, index) => ({
      name: services[index].name,
      ...(result.status === 'fulfilled' ? result.value : result.reason),
    }))
  },

  // Comprehensive health check
  async fullHealthCheck() {
    const startTime = Date.now()
    
    try {
      const [app, database, externalServices] = await Promise.allSettled([
        this.checkApp(),
        this.checkDatabase(),
        this.checkExternalServices(),
      ])

      const totalTime = Date.now() - startTime

      return {
        timestamp: new Date().toISOString(),
        status: 'completed',
        totalTime,
        checks: {
          application: app.status === 'fulfilled' ? app.value : app.reason,
          database: database.status === 'fulfilled' ? database.value : database.reason,
          externalServices: externalServices.status === 'fulfilled' ? externalServices.value : externalServices.reason,
        },
        overall: this.determineOverallHealth([
          app.status === 'fulfilled' ? app.value : app.reason,
          database.status === 'fulfilled' ? database.value : database.reason,
        ]),
      }
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message,
        totalTime: Date.now() - startTime,
      }
    }
  },

  determineOverallHealth(checks) {
    const unhealthyChecks = checks.filter(check => check.status === 'unhealthy')
    
    if (unhealthyChecks.length === 0) {
      return { status: 'healthy', score: 100 }
    } else if (unhealthyChecks.length === checks.length) {
      return { status: 'unhealthy', score: 0 }
    } else {
      const score = Math.round(((checks.length - unhealthyChecks.length) / checks.length) * 100)
      return { status: 'degraded', score }
    }
  },
}

// Run health check if called directly
if (require.main === module) {
  healthCheck.fullHealthCheck()
    .then(result => {
      console.log('🏥 Health Check Results:')
      console.log(JSON.stringify(result, null, 2))
      
      const exitCode = result.overall?.status === 'healthy' ? 0 : 1
      process.exit(exitCode)
    })
    .catch(error => {
      console.error('❌ Health check failed:', error)
      process.exit(1)
    })
}

module.exports = healthCheck
