export let error = (err) => {
    console.error(`Error: ${err}`)
}

export let info = (msg) => {
    console.info(msg)
}

export let prettyPrint = (key, value) => {    
    info({
        key: key,
        value: JSON.stringify(value)        
    })    
}