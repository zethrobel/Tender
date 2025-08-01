import React from "react"

function Footer() {
    let currentDate = new Date()

    let currentTime = currentDate.toLocaleDateString([], {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    })
    return (
        <footer>
            <p>
                copyright © <a href="https://robelzeleke.vercel.app">robelZeleke, {currentTime}</a> </p>
        </footer>
    )
}
export default Footer