class TypingSpeedTester {
  constructor() {
    this.textSamples = [
      "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice. It helps improve finger dexterity and keyboard familiarity.",
      "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat.",
      "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them.",
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light.",
      "All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue.",
      "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
      "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood.",
      "In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made.",
      "Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war.",
      "Space: the final frontier. These are the voyages of the starship Enterprise. Its five-year mission: to explore strange new worlds, to seek out new life and new civilizations, to boldly go where no man has gone before.",
    ]

    this.currentText = ""
    this.currentIndex = 0
    this.startTime = null
    this.endTime = null
    this.timer = null
    this.errors = 0
    this.isTestActive = false
    this.isTestComplete = false

    this.initializeElements()
    this.initializeEventListeners()
    this.loadBestWPM()
    this.resetTest()
  }

  initializeElements() {
    // Stats elements
    this.wpmElement = document.getElementById("wpm")
    this.errorsElement = document.getElementById("errors")
    this.timeElement = document.getElementById("time")
    this.bestWpmElement = document.getElementById("bestWpm")

    // Main elements
    this.textDisplay = document.getElementById("textDisplay")
    this.typingInput = document.getElementById("typingInput")
    this.countdown = document.getElementById("countdown")
    this.countdownNumber = document.getElementById("countdownNumber")

    // Control buttons
    this.resetBtn = document.getElementById("resetBtn")
    this.retryBtn = document.getElementById("retryBtn")

    // Modal elements
    this.modal = document.getElementById("resultsModal")
    this.finalWpm = document.getElementById("finalWpm")
    this.accuracy = document.getElementById("accuracy")
    this.finalTime = document.getElementById("finalTime")
    this.bestResult = document.getElementById("bestResult")
    this.modalReset = document.getElementById("modalReset")
    this.modalRetry = document.getElementById("modalRetry")
    this.modalClose = document.getElementById("modalClose")

    // Theme toggle
    this.themeToggle = document.getElementById("themeToggle")
  }

  initializeEventListeners() {
    // Input events
    this.typingInput.addEventListener("input", (e) => this.handleInput(e))
    this.typingInput.addEventListener("focus", () => this.startCountdown())
    this.typingInput.addEventListener("paste", (e) => e.preventDefault())

    // Button events
    this.resetBtn.addEventListener("click", () => this.resetTest())
    this.retryBtn.addEventListener("click", () => this.retryTest())

    // Modal events
    this.modalReset.addEventListener("click", () => {
      this.closeModal()
      this.resetTest()
    })
    this.modalRetry.addEventListener("click", () => {
      this.closeModal()
      this.retryTest()
    })
    this.modalClose.addEventListener("click", () => this.closeModal())

    // Theme toggle
    this.themeToggle.addEventListener("click", () => this.toggleTheme())

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal()
      }
      if (e.ctrlKey && e.key === "r") {
        e.preventDefault()
        this.resetTest()
      }
    })

    // Modal backdrop click
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeModal()
      }
    })
  }

  selectRandomText() {
    const randomIndex = Math.floor(Math.random() * this.textSamples.length)
    this.currentText = this.textSamples[randomIndex]
    this.displayText()
  }

  displayText() {
    this.textDisplay.innerHTML = this.currentText
      .split("")
      .map((char, index) => `<span class="char" data-index="${index}">${char === " " ? "&nbsp;" : char}</span>`)
      .join("")
  }

  startCountdown() {
    if (this.isTestActive || this.isTestComplete) return

    this.countdown.classList.add("active")
    this.typingInput.disabled = true

    let count = 3
    this.countdownNumber.textContent = count

    const countdownInterval = setInterval(() => {
      count--
      if (count > 0) {
        this.countdownNumber.textContent = count
        this.playBeep()
      } else {
        this.countdownNumber.textContent = "GO!"
        this.playStartBeep()

        setTimeout(() => {
          this.countdown.classList.remove("active")
          this.typingInput.disabled = false
          this.typingInput.focus()
          this.startTest()
        }, 500)

        clearInterval(countdownInterval)
      }
    }, 1000)
  }

  startTest() {
    this.isTestActive = true
    this.startTime = Date.now()
    this.startTimer()
    this.updateCurrentCharacter()
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.isTestActive) {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
        this.timeElement.textContent = elapsed
        this.calculateWPM()
      }
    }, 100)
  }

  handleInput(e) {
    if (!this.isTestActive) return

    const inputValue = e.target.value
    this.currentIndex = inputValue.length

    this.updateTextDisplay(inputValue)
    this.calculateStats(inputValue)
    this.updateCurrentCharacter()

    // Check if test is complete
    if (inputValue.length >= this.currentText.length) {
      this.completeTest()
    }
  }

  updateTextDisplay(inputValue) {
    const chars = this.textDisplay.querySelectorAll(".char")
    this.errors = 0

    chars.forEach((char, index) => {
      char.classList.remove("correct", "incorrect", "current")

      if (index < inputValue.length) {
        const inputChar = inputValue[index]
        const targetChar = this.currentText[index]

        if (inputChar === targetChar) {
          char.classList.add("correct")
        } else {
          char.classList.add("incorrect")
          this.errors++
        }
      }
    })
  }

  updateCurrentCharacter() {
    const chars = this.textDisplay.querySelectorAll(".char")
    chars.forEach((char) => char.classList.remove("current"))

    if (this.currentIndex < chars.length) {
      chars[this.currentIndex].classList.add("current")
    }
  }

  calculateStats(inputValue) {
    this.errorsElement.textContent = this.errors
    this.calculateWPM()
  }

  calculateWPM() {
    if (!this.startTime) return

    const timeElapsed = (Date.now() - this.startTime) / 1000 / 60 // in minutes
    const wordsTyped = this.typingInput.value.trim().split(/\s+/).length
    const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0

    this.wpmElement.textContent = wpm
  }

  completeTest() {
    this.isTestActive = false
    this.isTestComplete = true
    this.endTime = Date.now()

    clearInterval(this.timer)
    this.typingInput.disabled = true

    this.playCompleteBeep()
    this.showResults()
  }

  showResults() {
    const timeElapsed = (this.endTime - this.startTime) / 1000
    const wordsTyped = this.typingInput.value.trim().split(/\s+/).length
    const wpm = Math.round(wordsTyped / (timeElapsed / 60))
    const totalChars = this.currentText.length
    const accuracyPercent = Math.round(((totalChars - this.errors) / totalChars) * 100)

    this.finalWpm.textContent = wpm
    this.accuracy.textContent = `${accuracyPercent}%`
    this.finalTime.textContent = `${Math.round(timeElapsed)}s`

    // Check for new best WPM
    const bestWPM = this.getBestWPM()
    if (wpm > bestWPM) {
      this.setBestWPM(wpm)
      this.bestWpmElement.textContent = wpm
      this.bestResult.style.display = "block"
    } else {
      this.bestResult.style.display = "none"
    }

    this.openModal()
  }

  resetTest() {
    this.clearTest()
    this.selectRandomText()
  }

  retryTest() {
    this.clearTest()
    this.displayText()
  }

  clearTest() {
    this.isTestActive = false
    this.isTestComplete = false
    this.currentIndex = 0
    this.errors = 0
    this.startTime = null
    this.endTime = null

    clearInterval(this.timer)

    this.typingInput.value = ""
    this.typingInput.disabled = false

    this.wpmElement.textContent = "0"
    this.errorsElement.textContent = "0"
    this.timeElement.textContent = "0"

    this.countdown.classList.remove("active")
    this.closeModal()
  }

  openModal() {
    this.modal.classList.add("active")
    this.modal.setAttribute("aria-hidden", "false")
    this.modalClose.focus()
  }

  closeModal() {
    this.modal.classList.remove("active")
    this.modal.setAttribute("aria-hidden", "true")
    this.typingInput.focus()
  }

  // LocalStorage methods
  getBestWPM() {
    return Number.parseInt(localStorage.getItem("bestWPM") || "0")
  }

  setBestWPM(wpm) {
    localStorage.setItem("bestWPM", wpm.toString())
  }

  loadBestWPM() {
    this.bestWpmElement.textContent = this.getBestWPM()
  }

  // Theme methods
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"

    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)

    const icon = this.themeToggle.querySelector(".theme-icon")
    icon.textContent = newTheme === "dark" ? "☀️" : "🌙"
  }

  loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "light"
    document.documentElement.setAttribute("data-theme", savedTheme)

    const icon = this.themeToggle.querySelector(".theme-icon")
    icon.textContent = savedTheme === "dark" ? "☀️" : "🌙"
  }

  // Sound effects (simple beep using Web Audio API)
  playBeep() {
    this.playTone(800, 100)
  }

  playStartBeep() {
    this.playTone(1000, 200)
  }

  playCompleteBeep() {
    // Play a success melody
    setTimeout(() => this.playTone(523, 150), 0) // C
    setTimeout(() => this.playTone(659, 150), 150) // E
    setTimeout(() => this.playTone(784, 300), 300) // G
  }

  playTone(frequency, duration) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)
    } catch (error) {
      // Silently fail if Web Audio API is not supported
      console.log("Audio not supported")
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const app = new TypingSpeedTester()
  app.loadTheme()
})

// Service Worker registration for offline support (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => console.log("SW registered"))
      .catch((error) => console.log("SW registration failed"))
  })
}
