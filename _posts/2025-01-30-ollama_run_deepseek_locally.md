---
title: How to Install Ollama on Windows and Run DeepSeek R1 Locally
description: 'Install Ollama on Windows and run DeepSeek R1, Llama and other open-source models locally, step by step, with no cloud dependency.'
date: '2025-01-30'
categories: [Self-hosting]
tags: [ollama, ai, llm, windows, machine learning, deepseek r1, open source ai]
image: {path: /assets/img/posts/0c47c709f624.webp, alt: How to Install Ollama on Windows and Run DeepSeek R1 Locally}
---

{% include google-adsense.html %}

## How to Install Ollama on Windows and Run DeepSeek R1 Locally  

Running **large language models (LLMs) locally** has never been easier. With **Ollama**, you can install and use **DeepSeek R1, Llama 2, Gemma, and more** right on your Windows machine—no cloud computing required.  

In this guide, you'll learn:  
- How to **install Ollama on Windows**  
- How to **run DeepSeek R1**, the trending **67B parameter AI model**  
- How to use other models like **Llama 2 and Gemma** locally  

Let’s get started.  

### Step 1: Download and Install Ollama  

Installing Ollama is straightforward, just follow these steps:  

1. Head over to the official **[Ollama download page](https://ollama.com/download)**.  
2. Click on the **Windows download** option.  
3. Once the installer is downloaded, **run the setup file**.  
4. Follow the installation prompts (it’s a simple “Next, Next, Finish” process).  
5. Once installed, you’re ready to start using AI models on your local machine.  

### Step 2: Open the Command Line  

Ollama runs from the **command line (CMD or PowerShell)**. If you’ve never used the command line before, don’t worry—it’s easier than it looks.  

- Open the **Command Prompt** by pressing `Win + R`, typing `cmd`, and hitting **Enter**.  
- Alternatively, you can use **PowerShell** (just search for it in the Start Menu).  

### Step 3: Run Your First AI Model  

Now for the fun part. Ollama allows you to run AI models with a simple command. Let’s start with **Llama 2**, a powerful open-source language model:  

```sh
ollama run llama2
```

When you run this command:

Ollama will automatically download the Llama 2 model if you don’t already have it.
Once downloaded, it will start running the AI model, and you can chat with it right from the command line.


### Step 4: Running DeepSeek R1 Locally  

#### What is DeepSeek R1?  
DeepSeek R1 is an **open-weight LLM** available in multiple sizes, ranging from **1.5B to 671B parameters**. It is optimized for **reasoning, coding, and complex AI tasks**, making it one of the most powerful open-source alternatives to GPT-4.  

#### How to Install and Run DeepSeek R1  

By default, running the following command will download and start **DeepSeek R1 7B**:  

```sh
ollama run deepseek-r1
```

If this is your first time using DeepSeek R1, Ollama will automatically download the 7B model before starting it.


### DeepSeek R1 vs. Llama 2  

DeepSeek R1 is available in **multiple sizes**, ranging from **1.5B to 671B parameters**, making it a versatile option for different hardware setups and use cases.  

### **DeepSeek R1 Model Sizes:**  
- **1.5B** – Lightweight, optimized for efficiency.  
- **7B** – Default model in Ollama, good for general AI tasks.  
- **8B** – Slightly larger than 7B, with improved performance.  
- **14B** – More capable model for reasoning and longer responses.  
- **32B** – Stronger reasoning and context retention.  
- **70B** – High-end model with near GPT-4 class performance.  
- **671B** – Massive-scale model for enterprise and advanced AI research.  

### **DeepSeek R1 vs. Llama 2 Comparison**  

| Feature         | DeepSeek R1 (7B) | DeepSeek R1 (70B) | DeepSeek R1 (671B) | Llama 2 (7B / 13B / 65B) |
|---------------|----------------|----------------|----------------|------------------|
| Model Size    | 7B             | 70B           | 671B           | 7B / 13B / 65B   |
| Reasoning Ability | High          | Advanced       | Cutting-edge   | Moderate to High |
| Open-Weight   | ✅ Yes         | ✅ Yes         | ✅ Yes         | ✅ Yes |
| Hardware Requirements | Moderate  | High          | Extremely High | Varies |
| Ideal For     | General AI, coding, chatbots | Complex AI tasks, research | Enterprise-scale AI applications | General-purpose AI |

### **How to Run Different DeepSeek R1 Models in Ollama**  

By default, running `ollama run deepseek` will load the **7B version**.  

To specify a different model size, use:  

```sh
ollama run deepseek-r1:<size>
```

For example, to run the 70B model, use:

```sh
ollama run deepseek-r1:70b
```

Or, for the 671B version:

```sh
ollama run deepseek-r1:671b
```

You can list all available models with:

```sh
ollama list
```

This ensures you load the best model for your hardware and needs.

### Step 5: Explore Other AI Models  

Ollama supports many open-source models. To see the full list, run:  

```sh
ollama list
```

To run any model, use:

```sh
ollama run <model-name>
```

For example, to run Gemma, type:

```sh
ollama run gemma
```

## Why Use Ollama for Local AI Models?

Running DeepSeek R1, Llama 2, and other AI models locally with Ollama has several advantages:

- No cloud dependency – Run models without an internet connection.
- Full control over AI – No third-party monitoring or restrictions.
- Lower costs – Avoid cloud-based API fees.
- Faster response times – No latency issues from remote servers.

## Conclusion
By installing Ollama on Windows, you can run DeepSeek R1, Llama 2, and other LLMs entirely on your own hardware. This setup is ideal for developers, AI enthusiasts, and researchers looking to leverage powerful AI without relying on cloud services.

For more details, check out the official [Ollama documentation](https://ollama.com/).
