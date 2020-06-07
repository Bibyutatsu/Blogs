---
layout: single
author_profile: true
title:  proGENTRL
tags: [ml, optimization, GENTRL, pytorch-lightning]
---

# Pro Generative Tensorial Reinforcement Learning (proGENTRL)

In my first Blogpost I would like to talk about one of my projects I am currently working on Pro Generative Tensorial Reinforcement Learning AKA proGENTRL.
This is a [Pytorch Lightning](https://github.com/PyTorchLightning/pytorch-lightning) implementation of [*insilo medicine's* **GENTRL**](https://github.com/insilicomedicine/gentrl). 

Recently Pytorch Lightning has gained much popularity due to its lightweight framework and flexibility with handling multiple devices from a single GPU to a HPC cluster. So in order to maximize the efficiency of using GENTRL on multi-GPU environment I have implemented this pytorch lightning code.