# Pulsar Release Workflow

This repository is dedicated to automating the Pulsar Regular Release process.

Within this repository is an action that must be triggered to begin the regular release cycle.

The code in this repository is broken up into distinct steps to help communicate and separate the concerns of what is happening.

## Usage

Using this automation should be fairly simple.
Further documentation of this should be created in `pulsar-edit/.github`, but until then, the following steps **must** be taken for a successful release.

1) Ensure all PRs are merged into `master` on Pulsar.
2) Create and merge to `master` a full and complete `CHANGELOG.md`.
3) Manually trigger the "Automated Regular Release (Full)" `regular-release.yaml` step.
4) Once completed ensure the draft release on GitHub looks correct.
5) Merge the version update PR to `master` on Pulsar.
6) Update the release notes and post the release.
7) Manually trigger the "Followup Steps to Regular Release" `release-followups.yml` step.
8) Review and merge the PRs created for:
  - [`pulsar-edit/documentation`](https://github.com/pulsar-edit/documentation/pulls)
  - [`pulsar-edit/pulsar-chocolatey`](https://github.com/pulsar-edit/pulsar-chocolatey)
  - [`pulsar-edit/pulsar-edit.github.io`](https://github.com/pulsar-edit/pulsar-edit.github.io/)
9) Manually add a blog post to [`pulsar-edit/blogumentation`](https://github.com/pulsar-edit/blogumentation)
9) Manually post the new release news to all social channels.

## Steps to Achieve Complete Automation:

- [X] Create branch for new version
- [X] Bump new Version
- [X] Tag new Version
- [X] Create PR to `pulsar` with new version
- [X] Download bins from GitHub
- [X] Download bins from CirrusCi
- [X] Generate SHA256SUMs for bins
- [X] Create GitHub Release for new version
- [X] Upload assets to new version
- [X] Cleanup new version branch & PR
- [X] Create Chocolatey Release
- [X] Update download links
- [ ] Update website blog
- [X] Update Documentation Website
- [ ] Post news to socials: (WIP in './postToSocials', happy for any contributors)
  * [ ] Discord
  * [ ] Mastodon
  * [ ] Reddit
  * [ ] Lemmy
