export let error = (err) => {
    console.error(`Error: ${err}`)
}

export let info = (msg) => {
    console.info(msg)
}

export let prettyPrint = (value, key) => {          
    if (Array.isArray(value))   {                
        value.forEach(event => {            
            info({
                key: !key ? null : key,
                value: JSON.stringify(event)
            })                
        })
    } else  {
        info({
            key: !key ? null : key,
            value: JSON.stringify(value)        
        })    
    }    
}