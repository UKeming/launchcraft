---
description: "Update LaunchCraft plugin to the latest version"
disable-model-invocation: false
---

Update the LaunchCraft plugin by running these steps:

1. Pull the latest version from GitHub:
```bash
cd ~/.claude/plugins/marketplaces/launchcraft && git pull origin main
```

2. Run the plugin update:
```bash
claude plugin update launchcraft@launchcraft
```

3. Tell the user to restart Claude Code to apply the update.

Note: This is needed because `claude plugin update` has a known bug where it doesn't automatically fetch the latest from the remote marketplace repo.
