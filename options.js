import { configuration, fetchViaBackground } from '/modules.js';
import { $t } from '/i18n.js';

var vueOpts = {
    el: "#app",
    data: {
        editing: false,
        config: {
            configs: [],
            lang: 'chinese',
        },
        activeConfigIndex: -1,
        currentConfig: {
            apiType: "openai",
            apiUrl: "",
            apiKey: "",
            model: "",
            trial: false,
        },
        apiUrlOptions: [
            { label: "OpenAI", value: "https://api.openai.com/v1/chat/completions" },
            { label: "Groq", value: "https://api.groq.com/openai/v1/chat/completions" },
            { label: "DeepSeek", value: "https://api.deepseek.com/chat/completions" },
            { label: "OpenRouter", value: "https://openrouter.ai/api/v1/chat/completions" },
            { label: "OpenCode Go", value: "https://opencode.ai/zen/go/v1/chat/completions" },
            { label: "SiliconFlow", value: "https://api.siliconflow.cn/v1/chat/completions" },
            { label: "Moonshot Kimi", value: "https://api.moonshot.cn/v1/chat/completions" },
            { label: "Zhipu GLM", value: "https://open.bigmodel.cn/api/paas/v4/chat/completions" },
            { label: "Qwen", value: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions" },
            { label: "MiniMax", value: "https://api.minimaxi.com/v1/text/chatcompletion_v2" },
            { label: "xAI Grok", value: "https://api.x.ai/v1/chat/completions" },
            { label: "Mistral", value: "https://api.mistral.ai/v1/chat/completions" },
            { label: "Together", value: "https://api.together.xyz/v1/chat/completions" },
            { label: "Fireworks", value: "https://api.fireworks.ai/inference/v1/chat/completions" },
            { label: "GitHub Models", value: "https://models.github.ai/inference/chat/completions" },
            { label: "Ollama (Local)", value: "http://localhost:11434/v1/chat/completions" },
            { label: "LM Studio (Local)", value: "http://localhost:1234/v1/chat/completions" },
        ],
        modelOptions: [
            { label: "OpenAI", value: "gpt-3.5-turbo" },
            { label: "OpenAI", value: "gpt-4o" },
            { label: "OpenAI", value: "gpt-4o-mini" },
            { label: "OpenAI", value: "gpt-4.1" },
            { label: "OpenAI", value: "gpt-4.1-mini" },
            { label: "OpenAI", value: "o3-mini" },
            { label: "DeepSeek", value: "deepseek-chat" },
            { label: "DeepSeek", value: "deepseek-reasoner" },
            { label: "Groq", value: "llama-3.3-70b-versatile" },
            { label: "Groq", value: "llama3-70b-8192" },
            { label: "Groq", value: "gemma2-9b-it" },
            { label: "OpenRouter", value: "openai/gpt-4o-mini" },
            { label: "OpenRouter", value: "anthropic/claude-3.5-sonnet" },
            { label: "OpenRouter", value: "google/gemini-2.0-flash-exp:free" },
            { label: "OpenRouter", value: "meta-llama/llama-3.3-70b-instruct" },
            { label: "OpenRouter", value: "deepseek/deepseek-chat" },
            { label: "SiliconFlow", value: "deepseek-ai/DeepSeek-V3" },
            { label: "SiliconFlow", value: "Qwen/Qwen2.5-72B-Instruct" },
            { label: "OpenCode Go", value: "glm-5.3-flash" },
            { label: "OpenCode Go", value: "glm-5.3" },
            { label: "OpenCode Go", value: "glm-5.2" },
            { label: "OpenCode Go", value: "glm-5.1" },
            { label: "OpenCode Go", value: "deepseek-v4-flash" },
            { label: "OpenCode Go", value: "deepseek-v4-pro" },
            { label: "OpenCode Go", value: "kimi-k3" },
            { label: "OpenCode Go", value: "kimi-k2.7-code" },
            { label: "OpenCode Go", value: "kimi-k2.6" },
            { label: "OpenCode Go", value: "longcat-2.0" },
            { label: "OpenCode Go", value: "mimo-v2.5" },
            { label: "Moonshot Kimi", value: "moonshot-v1-8k" },
            { label: "Moonshot Kimi", value: "moonshot-v1-32k" },
            { label: "Moonshot Kimi", value: "kimi-k2-0711-preview" },
            { label: "Zhipu GLM", value: "glm-4-plus" },
            { label: "Zhipu GLM", value: "glm-4-flash" },
            { label: "Zhipu GLM", value: "glm-4-air" },
            { label: "Qwen", value: "qwen-plus" },
            { label: "Qwen", value: "qwen-turbo" },
            { label: "Qwen", value: "qwen-max" },
            { label: "MiniMax", value: "abab6.5s-chat" },
            { label: "xAI Grok", value: "grok-2-latest" },
            { label: "xAI Grok", value: "grok-beta" },
            { label: "Mistral", value: "mistral-large-latest" },
            { label: "Mistral", value: "mistral-small-latest" },
            { label: "Together", value: "meta-llama/Llama-3.3-70B-Instruct-Turbo" },
            { label: "Together", value: "Qwen/Qwen2.5-72B-Instruct-Turbo" },
            { label: "Fireworks", value: "accounts/fireworks/models/llama-v3p3-70b-instruct" },
            { label: "Google", value: "gemini-2.0-flash" },
            { label: "Google", value: "gemini-2.0-flash-exp" },
            { label: "Google", value: "gemini-1.5-pro" },
            { label: "Google", value: "gemini-1.5-flash" },
            { label: "Google", value: "gemini-1.5-flash-8b" },
        ],
    },
    methods: {
        async init() {
            const config = await configuration.load();
            this.config = config;

            if (this.config.lang == '-') {
                let lang = navigator.language || navigator.userLanguage;
                const langMap = {
                    zh: 'chinese',
                    en: 'english',
                    ja: 'japanese',
                    ko: 'korean',
                    fr: 'french',
                    es: 'spanish',
                    de: 'german',
                    ar: 'arabic',
                    ru: 'russian',
                };

                for (const [key, value] of Object.entries(langMap)) {
                    if (lang.includes(key)) {
                        this.config.lang = value;
                        break;
                    }
                }
            }
        },

        new() {
            this.activeConfigIndex = -1;
            this.currentConfig = {
                apiType: "openai",
                apiUrl: "",
                apiKey: "",
                model: "",
                trial: false,
                active: false,
            };
            this.editing = true;
        },

        async select(index = -1) {
            console.log("select", index);
            
            this.config.configs.forEach((cfg, idx) => {
                cfg.active = idx == index;
            });

            await configuration.save(this.config);
        },

        edit(index = 0) {
            console.log("edit");

            this.activeConfigIndex = index;
            const cfg = this.config.configs[index];
            this.currentConfig = { ...cfg };
            this.editing = true;
        },

        async delete() {
            console.log("delete");

            this.config.configs.splice(this.activeConfigIndex, 1);
            await configuration.save(this.config);

            this.activeConfigIndex = -1;
            this.editing = false;
        },

        cancel() {
            console.log("cancel");
            this.editing = false;
        },

        apiUrlInputChanged(value) {
            console.log("apiUrlInputChanged--", value);
            this.currentConfig.apiUrl = value;
        },

        modelInputChanged(value) {
            console.log("modelInputChanged--", value);
            this.currentConfig.model = value;
        },

        async testConnection() {
            if (this.currentConfig.apiType != 'google' && !this.currentConfig.apiUrl) {
                alert($t('api-url-required'));
                return;
            }

            if (!this.currentConfig.model) {
                alert($t('model-required'));
                return;
            }

            if (!this.currentConfig.apiKey) {
                alert($t('api-key-required'));
                return;
            }

            this.testing = true;
            try {
                let url, headers, data;
                if (this.currentConfig.apiType == 'google') {
                    url = `https://generativelanguage.googleapis.com/v1beta/models/${this.currentConfig.model}:streamGenerateContent?key=${this.currentConfig.apiKey}`;
                    headers = { 'Content-Type': 'application/json' };
                    data = {
                        contents: [
                            { parts: [{ text: 'Hi' }] }
                        ]
                    };
                } else {
                    url = this.currentConfig.apiUrl;
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + this.currentConfig.apiKey,
                    };
                    data = {
                        model: this.currentConfig.model,
                        stream: true,
                        messages: [
                            { role: 'user', content: 'Hi' },
                        ],
                    };
                }

                // The options page is an extension page and can fetch
                // cross-origin directly thanks to host_permissions.
                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    let detail = '';
                    try {
                        detail = (await response.text()).slice(0, 300);
                    } catch (e) {}
                    alert($t('test-fail') + ' (HTTP ' + response.status + (detail ? ': ' + detail : '') + ')');
                } else {
                    alert($t('test-success'));
                }
            } catch (error) {
                console.error(error);
                alert($t('test-fail') + ' (' + error.message + ')');
            } finally {
                this.testing = false;
            }
        },

        async saveConfig() {
            if (this.currentConfig.apiType != 'google' && !this.currentConfig.apiUrl) {
                alert($t('api-url-required'));
                return;
            }

            if (!this.currentConfig.model) {
                alert($t('model-required'));
                return;
            }

            if (!this.currentConfig.apiKey) {
                alert($t('api-key-required'));
                return;
            }

            if (this.activeConfigIndex >= 0) {
                this.config.configs.splice(this.activeConfigIndex, 1, {
                    ...this.currentConfig,
                });
            } else {
                this.config.configs.push({ ...this.currentConfig });
            }

            await configuration.save(this.config);

            this.activeConfigIndex = -1;
            this.editing = false;
            alert($t('save-success'));
        },

        async save() {
            console.log("save");

            await configuration.save(this.config);
            alert($t('save-success'));
        },
    },

    created: function () {
        console.log("mounted");
        this.init();
    },
};

Vue.component("dropdown-input", {
    template: `
      <div class="flex flex-col relative">
        <input 
          type="text" 
          class="input input-bordered flex-grow" 
          :value="value"
          :placeholder="placeholder"
          @input="updateValue($event.target.value)"
          @click="showDropdown = true"
        >
        <div 
          v-show="showDropdown"
          v-el:dropdown
          class="absolute w-full top-12 bg-white border rounded-md shadow-lg z-10"
        >
          <div
            v-for="option in options"
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-1 text-sm"
            @mousedown.prevent="selectOption(option)"
          >
            <span class="font-bold">{{ option.label }}</span>
            <span class="text-gray-500">{{ option.value }}</span>
          </div>
        </div>
      </div>
    `,
    props: ["value", "placeholder", "options"],
    data: function () {
        return {
            showDropdown: false,
        };
    },
    ready: function () {
        document.addEventListener("click", this.handleClickOutside);
    },
    beforeDestroy: function () {
        document.removeEventListener("click", this.handleClickOutside);
    },
    methods: {
        updateValue: function (value) {
            //console.log("updateValue--", typeof(value));
            this.$emit("changed", value);
        },
        selectOption: function (option) {
            this.$emit("changed", option.value);
            this.showDropdown = false;
        },
        handleClickOutside: function (event) {
            var dropdown = this.$els.dropdown;
            if (
                dropdown &&
                !dropdown.contains(event.target) &&
                !event.target.classList.contains("input")
            ) {
                this.showDropdown = false;
            }
        },
    },
});

new Vue(vueOpts);
