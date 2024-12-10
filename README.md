# Pulsar Release Workflow

This repository is dedicated to automating the Pulsar Regular Release process.

Within this repository is an action that must be triggered to begin the regular release cycle.

The code in this repository is broken up into distinct steps to help communicate and separate the concerns of what is happening.

## Steps to Achieve Complete Automation:

- [X] Create branch for new version
- [X] Bump new Version
- [X] Tag new Version
- [X] Create PR to `pulsar` with new version
- [X] Download bins from GitHub (when complete)
- [X] Download bins from CirrusCi (when complete)
- [X] Generate SHA256SUMs for bins
- [X] Create GitHub Release for new version
- [X] Upload assets to new version
- [X] Cleanup new version branch & PR
- [X] Create Chocolatey Release (Not Implemented)
- [X] Update download links (Not Implemented)
- [ ] Update website blog
- [ ] Post news to socials:
  * [ ] Discord
  * [ ] Mastodon
  * [ ] Reddit
  * [ ] Lemmy
