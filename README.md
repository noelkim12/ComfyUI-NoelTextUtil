# ComfyUI-NoelTextUtil

[English](./README.md) | [한국어](./README_KO.md)

Advanced text utility nodes for ComfyUI with LoRA trigger injection and unified prefix management.

> [!NOTE]
> This project was created with a [cookiecutter](https://github.com/Comfy-Org/cookiecutter-comfy-extension) template. It helps you start writing custom nodes without worrying about the Python setup.

## 🙏 Special Thanks

**NyaamZ** - For the excellent [Efficiency Nodes 💬ExtendeD](https://github.com/NyaamZ/efficiency-nodes-ED) project, which provided inspiration and reference patterns for the dynamic UI functionality and LoRA integration features in this project.

## 🚀 Quickstart

1. Install [ComfyUI](https://docs.comfy.org/get_started).
2. Install [ComfyUI-Manager](https://github.com/ltdrdata/ComfyUI-Manager).
3. Look up this extension in ComfyUI-Manager. If installing manually, clone this repository under `ComfyUI/custom_nodes`.
4. Restart ComfyUI.

## ✨ Features

### 🎯 NoelUnifiedPrefix Node
- **Character-based Prefix Management**: Generates organized file prefixes for character portraits and animations
- **Automatic Counter Management**: Maintains separate counters for portraits, runs, and frames per character
- **Smart Video Detection**: Detects new animation runs based on time gaps
- **Flexible Padding**: Configurable zero-padding for consistent file naming
- **State Persistence**: Saves character counters between sessions

### 🔥 NoelLoRATriggerInjector Node
- **LORA_STACK Integration**: Works with LoRA_Stacker_ED to detect active LoRAs
- **Dynamic Trigger Injection**: Injects LoRA triggers into positive prompts based on active LoRAs
- **Flexible Configuration**: 
  - Configurable LoRA slots (1-50, default: 5)
  - Append/Prepend injection modes
  - Deduplication support
  - Real-time LoRA slot management
- **Enhanced UI/UX**:
  - Dynamic node height adjustment
  - LoRA selection with search functionality
  - Real-time widget visibility management

## 🏗️ Architecture

### Node Structure

#### NoelUnifiedPrefix
```
Inputs:
├── character_name: Character name for prefix generation
├── pad_portrait: Zero-padding for portrait counter
├── pad_run: Zero-padding for animation run counter
├── pad_frame: Zero-padding for frame counter
├── gap_timeout_sec: Time gap to detect new animation runs
├── portrait_image: Optional portrait image input
└── video_image: Optional video frame input

Outputs:
├── portrait_fullprefix: "{character}/portrait_{###}"
├── portrait_image: Pass-through portrait image
├── video_fullprefix: "{character}/animation_{###}"
├── video_image: Pass-through video image
├── frame_fullprefix: "{character}/animation_{###}/{#####}"
└── frame_image: Pass-through video image
```

#### NoelLoRATriggerInjector
```
Required Inputs:
├── lora_count: Number of LoRA slots to display (1-50)
├── dedupe: Remove duplicate triggers
└── mode: "append" or "prepend" trigger injection

Optional Inputs:
├── lora_stack: LORA_STACK from LoRA_Stacker_ED
├── positive_prompt: Base prompt for trigger injection
└── lora_X_name + lora_X_triggers: LoRA configuration slots (1-50)

Outputs:
├── lora_stack: Pass-through LORA_STACK
├── positive_prompt: Enhanced prompt with injected triggers
└── injected_triggers: List of injected trigger strings
```

### JavaScript Extensions (lti.js)
- **Dynamic Widget Management**: Shows/hides LoRA slots based on `lora_count`
- **Smart Height Adjustment**: Automatically resizes node height using `node.setSize()`
- **Enhanced LoRA Selection**: Advanced dropdown with search and image previews
- **External Extension Compatibility**: Works with ed_betterCombos.js if available, falls back to basic functionality
- **Real-time UI Updates**: Immediate interface updates when `lora_count` changes

## 🔧 Usage Examples

### NoelUnifiedPrefix - Character File Management
1. **Portrait Generation**: Connect portrait images to generate `{character}/portrait_{###}` prefixes
2. **Animation Sequences**: Connect video frames to generate `{character}/animation_{###}/{#####}` prefixes
3. **Automatic Run Detection**: New animation runs are detected based on `gap_timeout_sec`
4. **State Persistence**: Character counters are automatically saved and restored

### NoelLoRATriggerInjector - LoRA Trigger Management
1. **Connect LORA_STACK**: Link from LoRA_Stacker_ED node
2. **Set LoRA Slots**: Configure `lora_count` and LoRA name/trigger pairs
3. **Automatic Detection**: Node automatically matches LORA_STACK with configured LoRAs
4. **Trigger Injection**: Triggers are injected into positive_prompt based on active LoRAs
5. **Output**: Enhanced prompt and LORA_STACK are passed to next nodes

### Advanced Configuration
- **Deduplication**: Enable to prevent duplicate triggers in the final prompt
- **Multiple LoRAs**: Configure up to 50 LoRA slots for complex workflows
- **Dynamic Adjustment**: Change `lora_count` on-the-fly to show/hide slots
- **Injection Modes**: Choose between append (end) or prepend (beginning) trigger placement

## 🎨 UI Features

### Dynamic Interface
- **Responsive Layout**: Node height automatically adjusts based on visible LoRA slots
- **Smart Widget Management**: Only shows the number of LoRA slots specified by `lora_count`
- **Real-time Updates**: Changes to `lora_count` immediately update the interface
- **Automatic Resizing**: Uses ComfyUI's native `setSize()` method for stable height management

### Enhanced LoRA Selection
- **Search Functionality**: Quick LoRA name search with real-time filtering
- **Image Previews**: Visual LoRA previews when ed_betterCombos.js is available
- **Dropdown Interface**: Clean, intuitive selection interface
- **Fallback Support**: Works with or without external extensions
- **Folder Integration**: Uses ComfyUI's `folder_paths.get_filename_list("loras")` for LoRA discovery

## 🔌 Dependencies

### Required
- ComfyUI (latest version recommended)
- Python 3.8+
- `folder_paths` module (built into ComfyUI)

### Optional
- **ed_betterCombos.js**: Enhanced LoRA selection with image previews (if available in your ComfyUI installation)

## 🚧 Development

To install the dev dependencies and pre-commit (will run the ruff hook), do:

```bash
cd ComfyUI-NoelTextUtil
pip install -e .[dev]
pre-commit install
```

The `-e` flag above will result in a "live" install, meaning any changes you make to your node extension will automatically be picked up the next time you run ComfyUI.

## 🧪 Testing

This repo contains unit tests written in Pytest in the `tests/` directory. It is recommended to unit test your custom node.

- [build-pipeline.yml](.github/workflows/build-pipeline.yml) will run pytest and linter on any open PRs
- [validate.yml](.github/workflows/validate.yml) will run [node-diff](https://github.com/Comfy-Org/node-diff) to check for breaking changes

## 📦 Publishing to Registry

If you wish to share this custom node with others in the community, you can publish it to the registry. We've already auto-populated some fields in `pyproject.toml` under `tool.comfy`, but please double-check that they are correct.

You need to make an account on https://registry.comfy.org and create an API key token.

- [ ] Go to the [registry](https://registry.comfy.org). Login and create a publisher id (everything after the `@` sign on your registry profile). 
- [ ] Add the publisher id into the pyproject.toml file.
- [ ] Create an api key on the Registry for publishing from Github. [Instructions](https://docs.comfy.org/registry/publishing#create-an-api-key-for-publishing).
- [ ] Add it to your Github Repository Secrets as `REGISTRY_ACCESS_TOKEN`.

A Github action will run on every git push. You can also run the Github action manually. Full instructions [here](https://docs.comfy.org/registry/publishing). Join our [discord](https://discord.com/invite/comfyorg) if you have any questions!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation for any API changes
- Ensure compatibility with ComfyUI's extension system

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ComfyUI Team**: For the excellent framework and extension system
- **Cookiecutter Template**: For the project scaffolding
- **Community**: For feedback and testing

## 📞 Support

- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Join the [ComfyUI Discord](https://discord.com/invite/comfyorg) for community support
- **Documentation**: Check the [ComfyUI docs](https://docs.comfy.org/) for general guidance

---

**Made with ❤️ for the ComfyUI community**

