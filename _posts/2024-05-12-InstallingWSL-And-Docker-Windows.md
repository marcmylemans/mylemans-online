---
title: How to Install WSL 2 and Docker on Windows
description: Install WSL 2 and Docker Desktop on Windows, set up Dockge to manage containers and deploy a hello-world webserver by converting docker run to Compose.
date: '2024-05-12 08:00:00'
categories: [Scripts]
tags: [automation, powershell, scripting, docker, wsl2, containers, webserver, linux, windows, devops, virtualization]
image: {path: /assets/img/posts/73f0de5efefe.png, alt: How to Install WSL 2 and Docker on Windows}
---

## **Introduction:**

In this blog post, we will guide you through the steps to install WSL 2 on Windows, set up Docker Desktop to work with WSL 2, install Dockge as a container management system, and run a demo webserver using Docker. This tutorial will help you leverage the power of Linux containers directly on your Windows machine.


## **Video Guide:**

{% youtube "https://youtu.be/dcSEcIHheOc" %}

## **Written Guide:**

### Step 1: Install WSL 2

#### Enable WSL and Virtual Machine Platform

First, enable the necessary features for WSL and the Virtual Machine Platform. By default, the installed Linux distribution will be Ubuntu. This can be changed using the -d flag.

1. Open PowerShell as Administrator.
2. Run the following command:

   **Enable Virtual Machine feature:**
   
   ```powershell
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   ```

   **Enable WSL:**

   ```powershell
   wsl --install
   ```

#### Set up your Linux username and password

After installing your Linux distribution, open it (Ubuntu is the default) from the Start menu. You will be prompted to create a username and password for the distribution.

- This username and password are unique to the Linux distribution and are not related to your Windows credentials.
- When entering your password, nothing will appear on the screen (blind typing), which is normal.
- The username and password you create will be used for logging in by default and will serve as the admin account for the distribution, allowing you to execute sudo (Super User Do) commands.
- Each Linux distribution you install on WSL will require you to set up a separate user account. This setup process must be repeated for each new distribution you add, reinstall, or reset.

#### Update and upgrade packages

```
sudo apt update && sudo apt upgrade
```

#### Optional: Change the default Linux Distribution

- To change the distribution installed, replace <Distribution Name> with the name of the distribution you would like to install, enter:
    ```powershell
    wsl --install -d <Distribution Name>
    ```
- To see a list of available Linux distributions available for download through the online store, enter:
    ```powershell
    wsl --list --online
    ```
- To install additional Linux distributions after the initial install, you may also use the command: 
   ```powershell
   wsl --install -d <Distribution Name>
   ```

### Step 2: Install Docker Desktop

1. Download Docker Desktop from the [official website](https://docs.docker.com/docker-for-windows/wsl/#download).
2. Run the installer and follow the prompts.
3. During the installation, ensure that the option to use WSL 2 instead of Hyper-V is selected.

#### Configure Docker to Use WSL 2

1. Open Docker Desktop.
2. Go to Settings > General and ensure "Use the WSL 2 based engine" is checked.
3. Go to Settings > Resources > WSL Integration and enable integration with your chosen Linux distribution(s).

#### Optional: Enable Nvidia Cuda Support

1. Open Docker Desktop.
2. Go to Settings > Docker Engine and add/replace the following under "Configure the Docker daemon by typing a json Docker daemon"

```
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "runtimes":{
      "nvidia":{
        "path":"/usr/bin/nvidia-container-runtime",
        "runtimeArgs":[]
    }
  }
}
```

3. Apply and restart


### Step 3: Install Dockge

[Dockge](https://github.com/louislam/dockge) is a container management system that simplifies managing Docker containers, similar to [Portainer](https://github.com/portainer/portainer). 

> You can customize the location and default port settings. The developer provides a website where you can configure these options and download a custom YAML file for setup.
{: .prompt-tip }

Visit the Dockge configuration site: [https://dockge.kuma.pet/](https://dockge.kuma.pet/)

#### Create Directories for Stacks and Dockge's Configuration

First, create the necessary directories to store your Docker stacks and Dockge's configuration:

```sh
sudo mkdir -p /opt/stacks /opt/dockge
cd /opt/dockge
```

#### Download the compose.yaml
Use the following command to download the default compose.yaml file. If you prefer to customize the settings, use the URL provided on the Dockge configuration site.

```sh
sudo curl https://raw.githubusercontent.com/louislam/dockge/master/compose.yaml --output compose.yaml
```

#### Start the server

```sh
docker compose up -d
```

#### Access the Dockge Web Interface

Once the Dockge server is running, you can access the web interface to manage your Docker containers. Open your web browser and navigate to [http://localhost:5001](http://localhost:5001). 
Enter a username and a password.

> If you changed the port in your configuration, make sure to use the adjusted port number.
{: .prompt-info }



### Step 4: Install a Demo Webserver

#### Download the Webserver Container

Navigate to [https://hub.docker.com/r/crccheck/hello-world](https://hub.docker.com/r/crccheck/hello-world) to find information about this container, including sample usage.

#### Using Dockge to Convert Docker Run Command to Docker Compose

One of the great features of Dockge is the ability to convert Docker run commands into Docker Compose files directly from its interface. Here’s how you can do it:

1. On the webpage, you will find a sample usage command for the container:
    ```sh
    docker run -d --rm --name web-test -p 80:8000 crccheck/hello-world
    ```
2. Copy this command and paste it into the 'docker run' field on the Dockge homepage.
3. Click 'Convert to Compose' to generate a Docker Compose file.
4. In the field labeled 'Stack Name', enter a name for the container (use lowercase letters and no spaces, e.g., `hello-world`).
5. On the right side, you will see the generated Docker Compose file. You can make additional changes if needed.
6. Once ready, press 'Deploy'.

After deploying, you will see the container start up, and a terminal session will display debug information. The container state (healthy) and the port will also be shown. You can access your new webserver by navigating to `http://localhost` or by clicking on the port number (80 in this example) to go directly to the hello-world webserver.


## **Conclusion**

In this tutorial, you learned how to install WSL 2 on Windows, set up Docker Desktop to work with WSL 2, install Dockge as a container management system, and run a Docker container to host a demo webserver. This setup provides a powerful and flexible environment for developing and running containerized applications on Windows.

Feel free to experiment further with Docker and explore more complex containerized applications!

Happy coding!
