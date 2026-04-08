# Whhaaat? CLI 🛡️

A sleek, premium CLI tool that explains terminal commands in simple English. Perfect for beginners or anyone who wants to double-check a scary-looking command before hitting Enter.

## ✨ Features

- **Simple Explanations**: No technical jargon, just what the command actually *does*.
- **Danger Warnings**: Highlights risky flags (like `-rf` or `777`) in bold red.
- **Safer Alternatives**: Recommends better ways to achieve the same goal.
- **Premium UI**: Beautiful gradients, boxes, and icons.

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Whhaaat-CLI.git
cd Whhaaat-CLI

# Install dependencies
npm install

# Link it globally
npm link
```

## 📖 Usage

You can use the `explain` keyword, or just pass the command directly:

```bash
whhaaat rm -rf /
whhaaat chmod 777 index.js
whhaaat explain ls
```

## 🛠️ Built With

- [Commander.js](https://github.com/tj/commander.js)
- [Chalk](https://github.com/chalk/chalk)
- [Boxen](https://github.com/sindresorhus/boxen)
- [Gradient String](https://github.com/bokub/gradient-string)
- [Ora](https://github.com/sindresorhus/ora)

## 🤝 Contributing

Feel free to open an issue or submit a pull request with more command definitions!
