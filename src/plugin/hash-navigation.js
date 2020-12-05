export const createHashNavigation = (anchor) => {
    let hashHandler, wheelHandler
    
    return {
        init: function() {
            hashHandler =  this.hashchange.bind(this)
            wheelHandler =  this.scrolling.bind(this)
            
            if(this.items.length !== anchor.length) {
                console.warn('[hash-navigation] hash array length should be equal with the number of wrappers')
            }

            window.addEventListener('hashchange', hashHandler, false)
            window.addEventListener('wheel', wheelHandler)
            
            const index = this.getLocationIndex()
            if(index > -1) {
                setTimeout(() => {
                    this.move(index, true)
                }, 100)
            }
        },
        
        scrolling: function() {
            if(this.getMode() === 'normal') {
                this.updateHash(this.getCurrent())
            }
        },
        
        hashchange: function () {
            const index = this.getLocationIndex()
            
            if(index > -1) {
                const current = this.getCurrent()
                const [ m, M ] = [Math.min(current, index), Math.max(current, index)]
                const silent = M - m > this.constants.DEFAULT_THRESHOLD

                this.move(index, { silent })
            }
        },
        
        destroy: function() {
            window.removeEventListener("hashchange", hashHandler)
            window.removeEventListener("wheel", wheelHandler)
        },
        
        getLocationIndex: () =>  {
            try {
                const val = location.hash.split('#')[1]
                return anchor.indexOf(val)
            } catch {
                return -1
            }
        },
        
        afterScroll: function() {
            this.updateHash(this.getCurrent())
        },
        
        updateHash: function(current) {
            if(typeof anchor[current] !== 'undefined') {
                location.hash = '#' + anchor[current]
            }
        }
    }
}