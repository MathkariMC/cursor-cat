const cat = document.querySelector(".cursor-cat")
const facingElement = document.querySelector(".cat-facing")
const spark = document.querySelector(".click-spark")
const monty = document.querySelector(".monty")
const elsa = document.querySelector(".elsa")
const oreo = document.querySelector(".oreo")

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
const nameLabelSpace = 32

let size = { width: cat.offsetWidth, height: cat.offsetHeight }
let targetX = Math.max(22, window.innerWidth * .14)
let targetY = window.innerHeight - size.height - 38
let currentX = targetX
let currentY = targetY
let facing = 1
let pounceTimer
const initialMontyBox = monty.getBoundingClientRect()
const initialOreoBox = oreo.getBoundingClientRect()
let montyPosition = { x: initialMontyBox.left, y: initialMontyBox.top }
let montyCenter = {
  x: initialMontyBox.left + initialMontyBox.width / 2,
  y: initialMontyBox.top + initialMontyBox.height / 2,
}
let montyIsHappy = false
let draggingMonty = false
let dragPointerId = null
let dragOffset = { x: 0, y: 0 }
let oreoPosition = { x: initialOreoBox.left, y: initialOreoBox.top }
let draggingOreo = false
let oreoPointerId = null
let oreoDragOffset = { x: 0, y: 0 }
let elsaMood = "calm"
let elsaCenter = { x: 0, y: 0 }
let oreoCenter = {
  x: initialOreoBox.left + initialOreoBox.width / 2,
  y: initialOreoBox.top + initialOreoBox.height / 2,
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(minimum, value), maximum)
}

function moveMonty(x, y) {
  montyPosition = { x, y }
  monty.style.transform = `translate3d(${x}px, ${y}px, 0)`
  montyCenter = {
    x: x + monty.offsetWidth / 2,
    y: y + monty.offsetHeight / 2,
  }
}

function moveOreo(x, y) {
  oreoPosition = { x, y }
  oreo.style.transform = `translate3d(${x}px, ${y}px, 0)`
  oreoCenter = {
    x: x + oreo.offsetWidth / 2,
    y: y + oreo.offsetHeight / 2,
  }
}

function measureScene() {
  size = { width: cat.offsetWidth, height: cat.offsetHeight }
  const elsaBox = elsa.getBoundingClientRect()
  elsaCenter = {
    x: elsaBox.left + elsaBox.width / 2,
    y: elsaBox.top + elsaBox.height / 2,
  }

  oreoPosition.x = clamp(oreoPosition.x, 8, window.innerWidth - oreo.offsetWidth - 8)
  oreoPosition.y = clamp(
    oreoPosition.y,
    8,
    window.innerHeight - oreo.offsetHeight - nameLabelSpace,
  )
  moveOreo(oreoPosition.x, oreoPosition.y)

  montyPosition.x = clamp(montyPosition.x, 8, window.innerWidth - monty.offsetWidth - 8)
  montyPosition.y = clamp(
    montyPosition.y,
    8,
    window.innerHeight - monty.offsetHeight - nameLabelSpace,
  )
  moveMonty(montyPosition.x, montyPosition.y)

  targetX = clamp(targetX, 12, window.innerWidth - size.width - 12)
  targetY = clamp(targetY, 12, window.innerHeight - size.height - nameLabelSpace)
}

function setTarget(clientX, clientY) {
  const edgeBuffer = size.width + 58
  const offsetX = clientX > window.innerWidth - edgeBuffer ? -size.width - 20 : 24
  const nextFacing = offsetX < 0 ? -1 : 1

  targetX = clamp(clientX + offsetX, 12, window.innerWidth - size.width - 12)
  targetY = clamp(
    clientY - size.height / 2,
    12,
    window.innerHeight - size.height - nameLabelSpace,
  )

  if (nextFacing !== facing) {
    facing = nextFacing
    facingElement.style.setProperty("--cat-facing", String(facing))
  }

  const eyeX = clamp((clientX - (targetX + size.width / 2)) / 20, -3, 3)
  const eyeY = clamp((clientY - (targetY + size.height * .39)) / 20, -2.5, 2.5)
  facingElement.style.setProperty("--eye-x", `${eyeX * facing}px`)
  facingElement.style.setProperty("--eye-y", `${eyeY}px`)
}

function updateMontyMood() {
  const catCenterX = currentX + size.width / 2
  const catCenterY = currentY + size.height / 2
  const deltaX = catCenterX - montyCenter.x
  const deltaY = catCenterY - montyCenter.y
  const distance = Math.hypot(deltaX, deltaY)
  const happyDistance = clamp(window.innerWidth * .22, 155, 255)
  const shouldBeHappy = distance < happyDistance

  if (shouldBeHappy !== montyIsHappy) {
    montyIsHappy = shouldBeHappy
    monty.dataset.happy = String(montyIsHappy)
  }

  monty.style.setProperty("--dog-eye-x", `${clamp(deltaX / 80, -2.2, 2.2)}px`)
  monty.style.setProperty("--dog-eye-y", `${clamp(deltaY / 80, -1.6, 1.6)}px`)
}

function updateElsaMood() {
  const catCenter = {
    x: currentX + size.width / 2,
    y: currentY + size.height / 2,
  }
  const distanceToCat = Math.hypot(
    catCenter.x - elsaCenter.x,
    catCenter.y - elsaCenter.y,
  )
  const distanceToMonty = Math.hypot(
    montyCenter.x - elsaCenter.x,
    montyCenter.y - elsaCenter.y,
  )
  const distanceToOreo = Math.hypot(
    oreoCenter.x - elsaCenter.x,
    oreoCenter.y - elsaCenter.y,
  )
  const dogIsMonty = distanceToMonty <= distanceToOreo
  const nearestDogCenter = dogIsMonty ? montyCenter : oreoCenter
  const distanceToDog = Math.min(distanceToMonty, distanceToOreo)
  const catDistance = clamp(window.innerWidth * .18, 135, 205)
  const dogDistance = clamp(window.innerWidth * .21, 160, 235)
  let nextMood = "calm"

  if (distanceToCat < catDistance) {
    nextMood = "upset"
  } else if (distanceToDog < dogDistance) {
    nextMood = "happy"
  }

  if (nextMood !== elsaMood) {
    elsaMood = nextMood
    elsa.dataset.mood = elsaMood
  }

  const lookTarget = elsaMood === "upset"
    ? {
        x: elsaCenter.x + (elsaCenter.x - catCenter.x),
        y: elsaCenter.y + (elsaCenter.y - catCenter.y),
      }
    : nearestDogCenter
  elsa.style.setProperty(
    "--hamster-eye-x",
    `${clamp((lookTarget.x - elsaCenter.x) / 85, -2, 2)}px`,
  )
  elsa.style.setProperty(
    "--hamster-eye-y",
    `${clamp((lookTarget.y - elsaCenter.y) / 85, -1.4, 1.4)}px`,
  )
}

function pounce(clientX, clientY) {
  setTarget(clientX, clientY)
  cat.classList.remove("is-pouncing")
  void cat.offsetWidth
  cat.classList.add("is-pouncing")

  spark.style.left = `${clientX}px`
  spark.style.top = `${clientY}px`
  spark.classList.remove("is-burst")
  void spark.offsetWidth
  spark.classList.add("is-burst")

  window.clearTimeout(pounceTimer)
  pounceTimer = window.setTimeout(() => cat.classList.remove("is-pouncing"), 540)
}

function animate() {
  const ease = reducedMotion.matches ? 1 : .115
  currentX += (targetX - currentX) * ease
  currentY += (targetY - currentY) * ease
  cat.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
  updateMontyMood()
  updateElsaMood()
  window.requestAnimationFrame(animate)
}

window.addEventListener("pointermove", (event) => {
  if (draggingMonty && event.pointerId === dragPointerId) {
    const x = clamp(
      event.clientX - dragOffset.x,
      8,
      window.innerWidth - monty.offsetWidth - 8,
    )
    const y = clamp(
      event.clientY - dragOffset.y,
      8,
      window.innerHeight - monty.offsetHeight - nameLabelSpace,
    )
    moveMonty(x, y)
  }

  if (draggingOreo && event.pointerId === oreoPointerId) {
    const x = clamp(
      event.clientX - oreoDragOffset.x,
      8,
      window.innerWidth - oreo.offsetWidth - 8,
    )
    const y = clamp(
      event.clientY - oreoDragOffset.y,
      8,
      window.innerHeight - oreo.offsetHeight - nameLabelSpace,
    )
    moveOreo(x, y)
  }

  if (event.pointerType !== "touch") setTarget(event.clientX, event.clientY)
}, { passive: true })

window.addEventListener("pointerdown", (event) => {
  pounce(event.clientX, event.clientY)
}, { passive: true })

monty.addEventListener("pointerdown", (event) => {
  event.preventDefault()
  event.stopPropagation()
  draggingMonty = true
  dragPointerId = event.pointerId
  dragOffset = {
    x: event.clientX - montyPosition.x,
    y: event.clientY - montyPosition.y,
  }
  monty.dataset.dragging = "true"
  monty.setPointerCapture(event.pointerId)
})

oreo.addEventListener("pointerdown", (event) => {
  event.preventDefault()
  event.stopPropagation()
  draggingOreo = true
  oreoPointerId = event.pointerId
  oreoDragOffset = {
    x: event.clientX - oreoPosition.x,
    y: event.clientY - oreoPosition.y,
  }
  oreo.dataset.dragging = "true"
  oreo.setPointerCapture(event.pointerId)
})

function releaseMonty(event) {
  if (!draggingMonty || event.pointerId !== dragPointerId) return
  draggingMonty = false
  dragPointerId = null
  monty.dataset.dragging = "false"
}

window.addEventListener("pointerup", releaseMonty)
window.addEventListener("pointercancel", releaseMonty)
monty.addEventListener("lostpointercapture", releaseMonty)

function releaseOreo(event) {
  if (!draggingOreo || event.pointerId !== oreoPointerId) return
  draggingOreo = false
  oreoPointerId = null
  oreo.dataset.dragging = "false"
}

window.addEventListener("pointerup", releaseOreo)
window.addEventListener("pointercancel", releaseOreo)
oreo.addEventListener("lostpointercapture", releaseOreo)

window.addEventListener("resize", measureScene)

facingElement.style.setProperty("--cat-facing", String(facing))
monty.style.right = "auto"
monty.style.bottom = "auto"
monty.style.left = "0"
monty.style.top = "0"
monty.dataset.dragging = "false"
moveMonty(montyPosition.x, montyPosition.y)
oreo.style.right = "auto"
oreo.style.bottom = "auto"
oreo.style.left = "0"
oreo.style.top = "0"
oreo.dataset.dragging = "false"
moveOreo(oreoPosition.x, oreoPosition.y)
measureScene()
window.requestAnimationFrame(animate)
