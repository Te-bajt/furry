/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import * as nls from 'vscode-nls'
const localize = nls.loadMessageBundle()

export interface LocalizationString {
    id: string
    defaultText: string
}

export function getLocalizedText(locString: LocalizationString, ...args: string[]): string {
    return localize(locString.id, locString.defaultText, ...args)
}

export const LOCALIZEDIDS = {
    Title: {
        AWStitle: {
            id: 'AWS.title',
            defaultText: 'AWS'
        },
        CreateCredentialProfile: {
            id: 'AWS.title.createCredentialProfile',
            defaultText: 'Create a new AWS credential profile'
        },
        CreatingCredentialProfile: {
            id: 'AWS.title.creatingCredentialProfile',
            defaultText: 'Saving new credential profile {0}'
        },
        SelectCredentialProfile: {
            id: 'AWS.title.selectCredentialProfile',
            defaultText: 'Select an AWS credential profile'
        }
    },
    CDK: {
        ExplorerTitle: {
            id: 'AWS.cdk.explorerTitle',
            defaultText: 'AWS CDK Explorer (Preview)'
        },
        ExplorerNode: {
            NoApps: {
                id: 'Aws.cdk.explorerNode.noApps',
                defaultText: '[No CDK Apps found in Workspaces]'
            },
            App: {
                NoConstructTree: {
                    id: 'Aws.cdk.explorerNode.app.noConstructTree',
                    defaultText: '[Unable to load construct tree for this App. Run `cdk synth`]'
                },
                NoStacks: {
                    id: 'Aws.cdk.explorerNode.app.noStacks',
                    defaultText: '[No stacks in this App]'
                }
            }
        }
    },
    Channel: {
        AWSToolkit: {
            id: 'AWS.channel.aws.toolkit',
            defaultText: 'AWS Toolkit'
        },
        AWSToolkitActivationError: {
            id: 'AWS.channel.aws.toolkit.activation.error',
            defaultText: 'Error Activating AWS Toolkit'
        }
    },
    CodelensLambda: {
        Invoke: {
            id: 'AWS.codelens.lambda.invoke',
            defaultText: 'Run Locally'
        },
        InvokeDebug: {
            id: 'AWS.codelens.lambda.invoke.debug',
            defaultText: 'Debug Locally'
        }
    },
    Configuration: {
        Title: {
            id: 'AWS.configuration.title',
            defaultText: 'AWS Configuration'
        },
        ProfileDescription: {
            id: 'AWS.configuration.profileDescription',
            defaultText: 'The name of the credential profile to obtain credentials from.'
        },
        SAMTemplateDepth: {
            id: 'AWS.configuration.sam.template.depth',
            defaultText:
                'The maximum subfolder depth within a workspace that the Toolkit will search for SAM Template files'
        },
        Description: {
            CDKExplorerEnabled: {
                id: 'AWS.configuration.description.cdk.explorer.enabled',
                defaultText: 'Enable the AWS CDK Explorer'
            },
            LogLevel: {
                id: 'AWS.configuration.description.logLevel',
                defaultText: "The AWS Toolkit's log level (changes reflected on restart)"
            },
            OnDefaultRegionMissing: {
                id: 'AWS.configuration.description.onDefaultRegionMissing',
                defaultText:
                    "Action to take when a Profile's default region is hidden in the Explorer. Possible values:\n* `add` - shows region in the explorer\n* `ignore` - does nothing with the region\n* `prompt` - (default) asks the user what they would like to do."
            },
            Telemetry: {
                id: 'AWS.configuration.description.telemetry',
                defaultText:
                    'Enable the AWS Toolkit to send usage data to AWS. `"Use the same setting as VS Code"` respects the value specified in "`telemetry.enableTelemetry`"'
            },
            SAMCLI: {
                DebugAttachRetryMaximum: {
                    id: 'AWS.configuration.description.samcli.debug.attach.retry.maximum',
                    defaultText:
                        'If the Toolkit is unable to attach a debugger, this is the number of times to retry before giving up.'
                },
                DebugAttachTimeout: {
                    id: 'AWS.configuration.description.samcli.debug.attach.timeout',
                    defaultText:
                        'Maximum amount of time to wait for debugger to connect to a SAM Local debug run (in milliseconds)'
                },
                Location: {
                    id: 'AWS.configuration.description.samcli.location',
                    defaultText:
                        'Location of SAM CLI. SAM CLI is used to create, build, package, and deploy Serverless Applications. [Learn More](https://aws.amazon.com/serverless/sam/)'
                }
            }
        }
    },
    Telemetry: {
        NotificationMessage: {
            id: 'AWS.telemetry.notificationMessage',
            defaultText:
                'Please help improve the AWS Toolkit by enabling it to send usage data to AWS. You can always change your mind later by going to the "AWS Configuration" section in your user settings.'
        },
        NotificationYes: {
            id: 'AWS.telemetry.notificationYes',
            defaultText: 'Enable'
        },
        NotificationNo: {
            id: 'AWS.telemetry.notificationNo',
            defaultText: 'Disable'
        }
    },
    Command: {
        Github: {
            id: 'AWS.command.github',
            defaultText: 'View Source on Github'
        },
        Help: {
            id: 'AWS.command.help',
            defaultText: 'View Documentation'
        },
        Login: {
            id: 'AWS.command.login',
            defaultText: 'Connect to AWS'
        },
        Logout: {
            id: 'AWS.command.logout',
            defaultText: 'Sign out'
        },
        ReportIssue: {
            id: 'AWS.command.reportIssue',
            defaultText: 'Report an Issue'
        },
        CreateNewSAMApp: {
            id: 'AWS.command.createNewSamApp',
            defaultText: 'Create new SAM Application'
        },
        CredentailProfileCreate: {
            id: 'AWS.command.credential.profile.create',
            defaultText: 'Create Credentials Profile'
        },
        ShowRegion: {
            id: 'AWS.command.showRegion',
            defaultText: 'Show region in the Explorer'
        },
        HideRegion: {
            id: 'AWS.command.hideRegion',
            defaultText: 'Hide region from the Explorer'
        },
        DeleteLambda: {
            id: 'AWS.command.deleteLambda',
            defaultText: 'Delete'
        },
        DeleteLambdaConfirm: {
            id: 'AWS.command.deleteLambda.confirm',
            defaultText: "Are you sure you want to delete lambda function '{0}'?"
        },
        DeleteLambdaError: {
            id: 'AWS.command.deleteLambda.error',
            defaultText: "There was an error deleting lambda function '{0}'"
        },
        DeploySAMApplication: {
            id: 'AWS.command.deploySamApplication',
            defaultText: 'Deploy SAM Application'
        },
        InvokeLambda: {
            id: 'AWS.command.invokeLambda',
            defaultText: 'Invoke on AWS'
        },
        ConfigureLambda: {
            id: 'AWS.command.configureLambda',
            defaultText: 'Configure'
        },
        RefreshAWSExplorer: {
            id: 'AWS.command.refreshAwsExplorer',
            defaultText: 'Refresh AWS Explorer'
        },
        RefreshCDKExplorer: {
            id: 'AWS.command.refreshCdkExplorer',
            defaultText: 'Refresh CDK Explorer'
        },
        CDKProvideFeedback: {
            id: 'AWS.command.cdk.provideFeedback',
            defaultText: 'Provide Feedback'
        },
        CDKHelp: {
            id: 'AWS.command.cdk.help',
            defaultText: 'View Documentation'
        },
        SAMCLIDetect: {
            id: 'AWS.command.samcli.detect',
            defaultText: 'Detect SAM CLI'
        },
        DeleteCloudFormation: {
            id: 'AWS.command.deleteCloudFormation',
            defaultText: 'Delete CloudFormation Stack'
        },
        ViewSchemaItem: {
            id: 'AWS.command.viewSchemaItem',
            defaultText: 'View Schema'
        },
        SearchSchema: {
            id: 'AWS.command.searchSchema',
            defaultText: 'Search Schemas'
        },
        SearchSchemaPerRegistry: {
            id: 'AWS.command.searchSchemaPerRegistry',
            defaultText: 'Search Schemas in Registry'
        },
        DownloadSchemaItemCode: {
            id: 'AWS.command.downloadSchemaItemCode',
            defaultText: 'Download Code Bindings'
        },
        ViewLogs: {
            id: 'AWS.command.viewLogs',
            defaultText: 'View AWS Toolkit Logs'
        },
        QuickStart: {
            id: 'AWS.command.quickStart',
            defaultText: 'View Quick Start'
        },
        QuickStartTitle: {
            id: 'AWS.command.quickStart.title',
            defaultText: 'AWS Toolkit - Quick Start'
        },
        QuickStartError: {
            id: 'AWS.command.quickStart.error',
            defaultText: 'There was an error retrieving the Quick Start page'
        },
        ShowErrorDetails: {
            id: 'AWS.command.showErrorDetails',
            defaultText: 'Show error details'
        }
    },
    CredentialsStatusBar: {
        NoCredentials: {
            id: 'AWS.credentials.statusbar.no.credentials',
            defaultText: '(not connected)'
        },
        Text: {
            id: 'AWS.credentials.statusbar.text',
            defaultText: 'AWS Credentials: {0}'
        },
        Tooltip: {
            id: 'AWS.credentials.statusbar.tooltip',
            defaultText:
                'The current credentials used by the AWS Toolkit.\n\nClick this status bar item to use different credentials.'
        }
    },
    Error: {
        DuringSAMLocal: {
            id: 'AWS.error.during.sam.local',
            defaultText: 'An error occurred trying to run SAM Application locally: {0}'
        },
        MFAUserCancelled: {
            id: 'AWS.error.mfa.userCancelled',
            defaultText: 'User cancelled entering authentication code'
        },
        NoErrorCode: {
            id: 'AWS.error.no.error.code',
            defaultText: 'No error code'
        },
        SAMLocalPackageJSONNotFound: {
            id: 'AWS.error.sam.local.package_json_not_found',
            defaultText: 'Unable to find package.json related to {0}'
        },
        CheckLogs: {
            id: 'AWS.error.check.logs',
            defaultText: 'Check the logs for more information by running the "{0}" command from the Command Palette.'
        }
    },
    ExplorerNode: {
        AddRegion: {
            id: 'AWS.explorerNode.addRegion',
            defaultText: 'Add a region to view functions...'
        },
        AddRegionTooltip: {
            id: 'AWS.explorerNode.addRegion.tooltip',
            defaultText: 'Click to add a region to view functions...'
        },
        Lambda: {
            NoFunctions: {
                id: 'AWS.explorerNode.lambda.noFunctions',
                defaultText: '[No Functions found]'
            },
            Retry: {
                id: 'AWS.explorerNode.lambda.retry',
                defaultText: 'Unable to load Lambda Functions, click here to retry'
            },
            Error: {
                id: 'AWS.explorerNode.lambda.error',
                defaultText: 'Error loading Lambda resources'
            }
        },
        CloudFormation: {
            NoFunctions: {
                id: 'AWS.explorerNode.cloudFormation.noFunctions',
                defaultText: '[Stack has no Lambda Functions]'
            },
            NoStacks: {
                id: 'AWS.explorerNode.cloudformation.noStacks',
                defaultText: '[No Stacks found]'
            },
            Error: {
                id: 'AWS.explorerNode.cloudFormation.error',
                defaultText: 'Error loading CloudFormation resources'
            }
        },
        ContainerNoItems: {
            id: 'AWS.explorerNode.container.noItems',
            defaultText: '[no items]'
        },
        SchemasError: {
            id: 'AWS.explorerNode.schemas.error',
            defaultText: "Error loading Schemas resources TEST '{0}'"
        },
        SchemasNoRegistry: {
            id: 'AWS.explorerNode.schemas.noRegistry',
            defaultText: '[No Schema Registries]'
        },
        Registry: {
            Error: {
                id: 'AWS.explorerNode.registry.error',
                defaultText: 'Error loading registry schema items'
            },
            NoSchemas: {
                id: 'AWS.explorerNode.registry.noSchemas',
                defaultText: '[no schemas in this registry]'
            },
            RegistryNameNotFound: {
                id: 'AWS.explorerNode.registry.registryName.Not.Found',
                defaultText: 'Registry name not found'
            }
        },
        SignIn: {
            id: 'AWS.explorerNode.signIn',
            defaultText: 'Connect to AWS...'
        },
        SignInTooltip: {
            id: 'AWS.explorerNode.signIn.tooltip',
            defaultText: 'Connect to AWS using a credential profile'
        }
    },
    Lambda: {
        ExplorerTitle: {
            id: 'AWS.lambda.explorerTitle',
            defaultText: 'Explorer'
        },
        ConfigureErrorFieldtype: {
            id: 'AWS.lambda.configure.error.fieldtype',
            defaultText:
                'Your templates.json file has an issue. {0} was detected as {1} instead of one of the following: [{2}]. Please change or remove this field, and try again.'
        },
        DebugNode: {
            LaunchConfigName: {
                id: 'AWS.lambda.debug.node.launchConfig.name',
                defaultText: 'Lambda: Debug {0} locally'
            },
            AttachConfigName: {
                id: 'AWS.lambda.debug.node.attachConfig.name',
                defaultText: 'Lambda: Attach to {0} locally'
            },
            InvokeTaskLabel: {
                id: 'AWS.lambda.debug.node.invokeTask.label',
                defaultText: 'Lambda: Invoke {0} locally'
            }
        }
    },
    Log: {
        FileLocation: {
            id: 'AWS.log.fileLocation',
            defaultText: 'Error logs for this session are permanently stored in {0}'
        },
        InvalidLevel: {
            id: 'AWS.log.invalidLevel',
            defaultText: 'Invalid log level: {0}'
        }
    },
    Message: {
        Loading: {
            id: 'AWS.message.loading',
            defaultText: 'Loading...'
        },
        Credentials: {
            Error: {
                id: 'AWS.message.credentials.error',
                defaultText: 'There was an issue trying to use credentials profile {0}: {1}'
            },
            InvalidProfile: {
                id: 'AWS.message.credentials.invalidProfile',
                defaultText: 'Credentials profile {0} is invalid'
            },
            InvalidProfileHelp: {
                id: 'AWS.message.credentials.invalidProfile.help',
                defaultText: 'Get Help...'
            }
        },
        EnterProfileName: {
            id: 'AWS.message.enterProfileName',
            defaultText: 'Enter the name of the credential profile to use'
        },
        Info: {
            CloudFormationDelete: {
                id: 'AWS.message.info.cloudFormation.delete',
                defaultText: 'Deleted CloudFormation Stack {0}'
            },
            SchemasDownloadCodeBindings: {
                Start: {
                    id: 'AWS.message.info.schemas.downloadCodeBindings.start',
                    defaultText: 'Downloading code for schema {0}...'
                },
                Generate: {
                    id: 'AWS.message.info.schemas.downloadCodeBindings.generate',
                    defaultText: '{0}: Generating code (this may take a few seconds the first time)...'
                },
                Extracting: {
                    id: 'AWS.message.info.schemas.downloadCodeBindings.extracting',
                    defaultText: '{0}: Extracting/copying code...'
                },
                Downloading: {
                    id: 'AWS.message.info.schemas.downloadCodeBindings.downloading',
                    defaultText: '{0}: Downloading code...'
                },
                Finished: {
                    id: 'AWS.message.info.schemas.downloadCodeBindings.finished',
                    defaultText: 'Downloaded code for schema {0}!'
                }
            }
        },
        Error: {
            CloudFormation: {
                Delete: {
                    id: 'AWS.message.error.cloudFormation.delete',
                    defaultText:
                        'An error occurred while deleting CloudFormation Stack {0}. Please check the stack events on the AWS Console'
                },
                Unsupported: {
                    id: 'AWS.message.error.cloudFormation.unsupported',
                    defaultText: 'Unable to delete a CloudFormation Stack. No stack provided.'
                }
            },
            Schemas: {
                ViewSchemaCouldNotOpen: {
                    id: 'AWS.message.error.schemas.viewSchema.could_not_open',
                    defaultText: 'Could not fetch and display schema {0} contents'
                },
                DownloadCodeBindings: {
                    FailedToDownload: {
                        id: 'AWS.message.error.schemas.downloadCodeBindings.failed_to_download',
                        defaultText: 'Unable to download schema code'
                    },
                    FailedToGenerate: {
                        id: 'AWS.message.error.schemas.downloadCodeBindings.failed_to_generate',
                        defaultText: 'Unable to generate schema code'
                    },
                    FailedToExtractCollision: {
                        id: 'AWS.message.error.schemas.downloadCodeBindings.failed_to_extract_collision',
                        defaultText:
                            'Unable to place schema code in workspace because there is already a file {0} in the folder hierarchy'
                    },
                    InvalidCodeGenerationStatus: {
                        id: 'AWS.message.error.schemas.downloadCodeBindings.invalid_code_generation_status',
                        defaultText: 'Invalid Code generation status {0}'
                    },
                    Timeout: {
                        id: 'AWS.message.error.schemas.downloadCodeBindings.timout',
                        defaultText: 'Failed to download code for schema {0} before timeout. Please try again later'
                    }
                },
                Search: {
                    FailedToSearchRegistry: {
                        id: 'AWS.message.error.schemas.search.failed_to_search_registry',
                        defaultText: 'Unable to search registry {0}'
                    },
                    FailedToLoadResources: {
                        id: 'AWS.message.error.schemas.search.failed_to_load_resources',
                        defaultText: 'Error loading Schemas resources'
                    }
                }
            }
        },
        SelectRegion: {
            id: 'AWS.message.selectRegion',
            defaultText: 'Select an AWS region'
        },
        SelectProfile: {
            id: 'AWS.message.selectProfile',
            defaultText: 'Select an AWS credential profile'
        },
        StatusBar: {
            Loading: {
                CloudFormation: {
                    id: 'AWS.message.statusBar.loading.cloudFormation',
                    defaultText: 'Loading CloudFormations...'
                },
                Lambda: {
                    id: 'AWS.message.statusBar.loading.lambda',
                    defaultText: 'Loading Lambdas...'
                },
                Registries: {
                    id: 'AWS.message.statusBar.loading.registries',
                    defaultText: 'Loading Registry Items...'
                },
                SchemaItems: {
                    id: 'AWS.message.statusBar.loading.schemaItems',
                    defaultText: 'Loading Schema Items...'
                }
            },
            SearchingSchemas: {
                id: 'AWS.message.statusBar.searching.schemas',
                defaultText: 'Searching Schemas...'
            }
        },
        Prompt: {
            DefaultRegionHidden: {
                CurrentlyHidden: {
                    id: 'AWS.message.prompt.defaultRegionHidden',
                    defaultText:
                        "This profile's default region ({0}) is currently hidden. Would you like to show it in the Explorer?"
                },
                Add: {
                    id: 'AWS.message.prompt.defaultRegionHidden.add',
                    defaultText: 'Yes'
                },
                AlwaysAdd: {
                    id: 'AWS.message.prompt.defaultRegionHidden.alwaysAdd',
                    defaultText: "Yes, and don't ask again"
                },
                Ignore: {
                    id: 'AWS.message.prompt.defaultRegionHidden.ignore',
                    defaultText: 'No'
                },
                AlwaysIgnore: {
                    id: 'AWS.message.prompt.defaultRegionHidden.alwaysIgnore',
                    defaultText: "No, and don't ask again"
                },
                Suppressed: {
                    id: 'AWS.message.prompt.defaultRegionHidden.suppressed',
                    defaultText:
                        "You will no longer be asked what to do when the current profile's default region is hidden from the Explorer. This behavior can be changed by modifying the '{0}' setting."
                }
            },
            CloudFormationDelete: {
                id: 'AWS.message.prompt.cloudFormation.delete',
                defaultText: 'Are you sure you want to delete {0}?'
            },
            Credentials: {
                Create: {
                    id: 'AWS.message.prompt.credentials.create',
                    defaultText:
                        'You do not appear to have any AWS Credentials defined. Would you like to set one up now?'
                },
                DefinitionHelp: {
                    id: 'AWS.message.prompt.credentials.definition.help',
                    defaultText: 'Would you like some information related to defining credentials?'
                },
                DefinitionTryAgain: {
                    id: 'AWS.message.prompt.credentials.definition.tryAgain',
                    defaultText: 'The credentials do not appear to be valid ({0}). Would you like to try again?'
                }
            },
            SelectLocalLambdaPlaceHolder: {
                id: 'AWS.message.prompt.selectLocalLambda.placeholder',
                defaultText: 'Select a lambda function'
            },
            QuickStartToastMessage: {
                id: 'AWS.message.prompt.quickStart.toastMessage',
                defaultText: 'You are now using the AWS Toolkit for Visual Studio Code, version {0}'
            }
        }
    },
    Schemas: {
        DownloadCodeBindings: {
            InitWizard: {
                LanguagePrompt: {
                    id: 'AWS.schemas.downloadCodeBindings.initWizard.language.prompt',
                    defaultText: 'Select a code binding language'
                },
                VersionPrompt: {
                    id: 'AWS.schemas.downloadCodeBindings.initWizard.version.prompt',
                    defaultText: 'Select a version for schema {0} :'
                },
                LocationPrompt: {
                    id: 'AWS.schemas.downloadCodeBindings.initWizard.location.prompt',
                    defaultText: 'Select a workspace folder to download code binding'
                },
                LocationSelectFolderDetail: {
                    id: 'AWS.schemas.downloadCodeBindings.initWizard.location.select.folder.detail',
                    defaultText: 'Code bindings will be downloaded to selected folder.'
                }
            }
        },
        Search: {
            Title: {
                id: 'AWS.schemas.search.title',
                defaultText: 'EventBridge Schemas Search'
            },
            NoRegistries: {
                id: 'AWS.schemas.search.no_registries',
                defaultText: 'No Schema Registries'
            },
            HeaderTextSingleRegistry: {
                id: 'AWS.schemas.search.header.text.singleRegistry',
                defaultText: 'Search "{0}" registry'
            },
            HeaderTextAllRegistries: {
                id: 'AWS.schemas.search.header.text.allRegistries',
                defaultText: 'Search across all registries'
            },
            InputPlaceholder: {
                id: 'AWS.schemas.search.input.placeholder',
                defaultText: 'Search for schema keyword...'
            },
            VersionPrefix: {
                id: 'AWS.schemas.search.version.prefix',
                defaultText: 'Search matched version:'
            },
            NoResults: {
                id: 'AWS.schemas.search.no_results',
                defaultText: 'No schemas found'
            },
            Searching: {
                id: 'AWS.schemas.search.searching',
                defaultText: 'Searching for schemas...'
            },
            Loading: {
                id: 'AWS.schemas.search.loading',
                defaultText: 'Loading...'
            },
            Select: {
                id: 'AWS.schemas.search.select',
                defaultText: 'Select a schema'
            }
        }
    },
    Output: {
        BuildingSAMApplication: {
            id: 'AWS.output.building.sam.application',
            defaultText: 'Building SAM Application...'
        },
        BuildingSAMApplicationComplete: {
            id: 'AWS.output.building.sam.application.complete',
            defaultText: 'Build complete.'
        },
        SAMLocal: {
            Attaching: {
                id: 'AWS.output.sam.local.attaching',
                defaultText: 'Attaching debugger to SAM Application...'
            },
            AttachSuccess: {
                id: 'AWS.output.sam.local.attach.success',
                defaultText: 'Debugger attached'
            },
            AttachFailure: {
                id: 'AWS.output.sam.local.attach.failure',
                defaultText:
                    'Unable to attach Debugger. Check the Terminal tab for output. If it took longer than expected to successfully start, you may still attach to it.'
            },
            RetryLimitExceeded: {
                id: 'AWS.output.sam.local.attach.retry.limit.exceeded',
                defaultText: 'Retry limit reached while trying to attach the debugger.'
            },
            Error: {
                id: 'AWS.output.sam.local.error',
                defaultText: 'Error: {0}'
            },
            Start: {
                id: 'AWS.output.sam.local.start',
                defaultText: 'Preparing to run {0} locally...'
            },
            Waiting: {
                id: 'AWS.output.sam.local.waiting',
                defaultText: 'Waiting for SAM Application to start before attaching debugger...'
            }
        },
        StartingSAMAppLocally: {
            id: 'AWS.output.starting.sam.app.locally',
            defaultText: 'Starting the SAM Application locally (see Terminal for output)'
        }
    },
    PromptMFAEnterCode: {
        Placeholder: {
            id: 'AWS.prompt.mfa.enterCode.placeholder',
            defaultText: 'Enter Authentication Code Here'
        },
        Prompt: {
            id: 'AWS.prompt.mfa.enterCode.prompt',
            defaultText: 'Enter authentication code for profile {0}'
        }
    },
    Placeholder: {
        InputAccessKey: {
            id: 'AWS.placeHolder.inputAccessKey',
            defaultText: 'Input the AWS Access Key to be stored in the profile'
        },
        InputSecretKey: {
            id: 'AWS.placeHolder.inputSecretKey',
            defaultText: 'Input the AWS Secret Key'
        },
        NewProfilename: {
            id: 'AWS.placeHolder.newProfileName',
            defaultText: 'Choose a unique name for the new profile'
        },
        SelectProfile: {
            id: 'AWS.placeHolder.selectProfile',
            defaultText: 'Select a credential profile'
        }
    },
    ProfileRecentlyUsed: {
        id: 'AWS.profile.recentlyUsed',
        defaultText: 'recently used'
    },
    RunningCommand: {
        id: 'AWS.running.command',
        defaultText: 'Running command: {0}'
    },
    SAMLocalInvokePythonServerNotAvailable: {
        id: 'AWS.sam.local.invoke.python.server.not.available',
        defaultText:
            'Unable to communicate with the Python Debug Adapter. The debugger might not successfully attach to your SAM Application.'
    },
    SAMCLI: {
        DetectSettings: {
            Updated: {
                id: 'AWS.samcli.detect.settings.updated',
                defaultText: 'Settings updated.'
            },
            NotUpdated: {
                id: 'AWS.samcli.detect.settings.not.updated',
                defaultText: 'No settings changes necessary.'
            }
        },
        Deploy: {
            GeneralError: {
                id: 'AWS.samcli.deploy.general.error',
                defaultText: 'An error occurred while deploying a SAM Application. {0}'
            },
            Workflow: {
                Init: {
                    id: 'AWS.samcli.deploy.workflow.init',
                    defaultText: 'Building SAM Application...'
                },
                Packaging: {
                    id: 'AWS.samcli.deploy.workflow.packaging',
                    defaultText: 'Packaging SAM Application to S3 Bucket: {0} with profile: {1}'
                },
                StackNameInitiated: {
                    id: 'AWS.samcli.deploy.workflow.stackName.initiated',
                    defaultText: 'Deploying SAM Application to CloudFormation Stack: {0} with profile: {1}'
                },
                Start: {
                    id: 'AWS.samcli.deploy.workflow.start',
                    defaultText: 'Starting SAM Application deployment...'
                },
                Success: {
                    id: 'AWS.samcli.deploy.workflow.success',
                    defaultText: 'Successfully deployed SAM Application to CloudFormation Stack: {0} with profile: {1}'
                },
                SuccessGeneral: {
                    id: 'AWS.samcli.deploy.workflow.success.general',
                    defaultText: 'SAM Application deployment succeeded.'
                },
                Error: {
                    id: 'AWS.samcli.deploy.workflow.error',
                    defaultText: 'Failed to deploy SAM application.'
                }
            },
            Paramaters: {
                MandatoryPrompt: {
                    Message: {
                        id: 'AWS.samcli.deploy.parameters.mandatoryPrompt.message',
                        defaultText:
                            'The template {0} contains parameters without default values. In order to deploy, you must provide values for these parameters. Configure them now?'
                    },
                    ResponseConfigure: {
                        id: 'AWS.samcli.deploy.parameters.mandatoryPrompt.responseConfigure',
                        defaultText: 'Configure'
                    },
                    ResponseCancel: {
                        id: 'AWS.samcli.deploy.parameters.mandatoryPrompt.responseCancel',
                        defaultText: 'Cancel'
                    }
                },
                OptionalPrompt: {
                    Message: {
                        id: 'AWS.samcli.deploy.parameters.optionalPrompt.message',
                        defaultText:
                            'The template {0} contains parameters. Would you like to override the default values for these parameters?'
                    },
                    ResponseYes: {
                        id: 'AWS.samcli.deploy.parameters.optionalPrompt.responseYes',
                        defaultText: 'Yes'
                    },
                    ResponseNo: {
                        id: 'AWS.samcli.deploy.parameters.optionalPrompt.responseNo',
                        defaultText: 'No'
                    }
                }
            },
            RegionPrompt: {
                id: 'AWS.samcli.deploy.region.prompt',
                defaultText: 'Which AWS Region would you like to deploy to?'
            },
            S3Bucket: {
                Region: {
                    id: 'AWS.samcli.deploy.s3Bucket.region',
                    defaultText: 'S3 bucket must be in selected region: {0}'
                },
                Prompt: {
                    id: 'AWS.samcli.deploy.s3Bucket.prompt',
                    defaultText: 'Enter the AWS S3 bucket to which your code should be deployed'
                },
                ErrorEmpty: {
                    id: 'AWS.samcli.deploy.s3Bucket.error',
                    defaultText: 'S3 bucket cannot be empty'
                },
                Error: {
                    Length: {
                        id: 'AWS.samcli.deploy.s3Bucket.error.length',
                        defaultText: 'S3 bucket name must be between 3 and 63 characters long'
                    },
                    InvalidCharacters: {
                        id: 'AWS.samcli.deploy.s3Bucket.error.invalidCharacters',
                        defaultText:
                            'S3 bucket name may only contain lower-case characters, numbers, periods, and dashes'
                    },
                    IPAddress: {
                        id: 'AWS.samcli.deploy.s3Bucket.error.ipAddress',
                        defaultText: 'S3 bucket name may not be formatted as an IP address (198.51.100.24)'
                    },
                    EndsWithDash: {
                        id: 'AWS.samcli.deploy.s3Bucket.error.endsWithDash',
                        defaultText: 'S3 bucket name may not end with a dash'
                    },
                    ConsecutivePeriods: {
                        id: 'AWS.samcli.deploy.s3Bucket.error.consecutivePeriods',
                        defaultText: 'S3 bucket name may not have consecutive periods'
                    },
                    DashAdjacentPeriods: {
                        id: 'AWS.samcli.deploy.s3Bucket.error.dashAdjacentPeriods',
                        defaultText: 'S3 bucket name may not contain a period adjacent to a dash'
                    },
                    LabelFirstCharacter: {
                        id: 'AWS.samcli.deploy.s3Bucket.error.labelFirstCharacter',
                        defaultText:
                            'Each label in an S3 bucket name must begin with a number or a lower-case character'
                    }
                }
            },
            Stackname: {
                Prompt: {
                    id: 'AWS.samcli.deploy.stackName.prompt',
                    defaultText: 'Enter the name to use for the deployed stack'
                },
                Error: {
                    InvalidCharacters: {
                        id: 'AWS.samcli.deploy.stackName.error.invalidCharacters',
                        defaultText:
                            'A stack name may contain only alphanumeric characters (case sensitive) and hyphens'
                    },
                    FirstCharacter: {
                        id: 'AWS.samcli.deploy.stackName.error.firstCharacter',
                        defaultText: 'A stack name must begin with an alphabetic character'
                    },
                    Length: {
                        id: 'AWS.samcli.deploy.stackName.error.length',
                        defaultText: 'A stack name must not be longer than 128 characters'
                    }
                }
            },
            StatusBarMessage: {
                id: 'AWS.samcli.deploy.statusbar.message',
                defaultText: '$(cloud-upload) Deploying SAM Application to {0}...'
            },
            TemplatePrompt: {
                id: 'AWS.samcli.deploy.template.prompt',
                defaultText: 'Which SAM Template would you like to deploy to AWS?'
            }
        },
        ConfiguredLocation: {
            id: 'AWS.samcli.configured.location',
            defaultText: 'Configured SAM CLI Location: {0}'
        },
        Error: {
            NotFound: {
                id: 'AWS.samcli.error.notFound',
                defaultText:
                    'Unable to find the SAM CLI, which is required to create new Serverless Applications and debug them locally. If you have already installed the SAM CLI, update your User Settings by locating it.'
            },
            NotFoundBrief: {
                id: 'AWS.samcli.error.notFound.brief',
                defaultText: 'Could not get SAM CLI location'
            }
        },
        Local: {
            Invoke: {
                Ended: {
                    id: 'AWS.samcli.local.invoke.ended',
                    defaultText: 'Local invoke of SAM Application has ended.'
                },
                Error: {
                    id: 'AWS.samcli.local.invoke.error',
                    defaultText: 'Error encountered running local SAM Application'
                },
                PortNotOpen: {
                    id: 'AWS.samcli.local.invoke.port.not.open',
                    defaultText:
                        "The debug port doesn't appear to be open. The debugger might not succeed when attaching to your SAM Application."
                },
                RuntimeUnsupported: {
                    id: 'AWS.samcli.local.invoke.runtime.unsupported',
                    defaultText: 'Unsupported {0} runtime: {1}'
                },
                Debugger: {
                    Install: {
                        id: 'AWS.samcli.local.invoke.debugger.install',
                        defaultText: 'Installing .NET Core Debugger to {0}...'
                    },
                    InstallFailed: {
                        id: 'AWS.samcli.local.invoke.debugger.install.failed',
                        defaultText: 'Error installing .NET Core Debugger: {0}'
                    },
                    Timeout: {
                        id: 'AWS.samcli.local.invoke.debugger.timeout',
                        defaultText: 'The SAM process did not make the debugger available within the time limit'
                    }
                }
            }
        },
        Notification: {
            NotFound: {
                id: 'AWS.samcli.notification.not.found',
                defaultText:
                    'Unable to find SAM CLI. It is required in order to work with Serverless Applications locally.'
            },
            UnexpectedValidationIssue: {
                id: 'AWS.samcli.notification.unexpected.validation.issue',
                defaultText: 'An unexpected issue occured while validating SAM CLI: {0}'
            },
            VersionInvalid: {
                id: 'AWS.samcli.notification.version.invalid',
                defaultText:
                    'Your SAM CLI version {0} does not meet requirements ({1}\u00a0\u2264\u00a0version\u00a0<\u00a0{2}). {3}'
            },
            VersionValid: {
                id: 'AWS.samcli.notification.version.valid',
                defaultText: 'Your SAM CLI version {0} is valid.'
            }
        },
        RecommendUpdate: {
            Toolkit: {
                id: 'AWS.samcli.recommend.update.toolkit',
                defaultText: 'Please check the Marketplace for an updated Toolkit.'
            },
            SAMCLI: {
                id: 'AWS.samcli.recommend.update.samcli',
                defaultText: 'Please update your SAM CLI.'
            }
        },
        UserChoice: {
            Browse: {
                id: 'AWS.samcli.userChoice.browse',
                defaultText: 'Locate SAM CLI...'
            },
            VisitInstallURL: {
                id: 'AWS.samcli.userChoice.visit.install.url',
                defaultText: 'Get SAM CLI'
            },
            UpdateAwstoolkitURL: {
                id: 'AWS.samcli.userChoice.update.awstoolkit.url',
                defaultText: 'Visit Marketplace'
            }
        },
        InitWizard: {
            GeneralError: {
                id: 'AWS.samcli.initWizard.general.error',
                defaultText: 'An error occurred while creating a new SAM Application. {0}'
            },
            LocationPrompt: {
                id: 'AWS.samcli.initWizard.location.prompt',
                defaultText: 'Select a workspace folder for your new project'
            },
            LocationSelectFolderDetail: {
                id: 'AWS.samcli.initWizard.location.select.folder.detail',
                defaultText: 'The folder you select will be added to your VS Code workspace.'
            },
            Name: {
                Prompt: {
                    id: 'AWS.samcli.initWizard.name.prompt',
                    defaultText: 'Enter a name for your new application'
                },
                Error: {
                    Empty: {
                        id: 'AWS.samcli.initWizard.name.error.empty',
                        defaultText: 'Application name cannot be empty'
                    },
                    PathSep: {
                        id: 'AWS.samcli.initWizard.name.error.pathSep',
                        defaultText: 'The path separator ({0}) is not allowed in application names'
                    }
                }
            },
            RuntimePrompt: {
                id: 'AWS.samcli.initWizard.runtime.prompt',
                defaultText: 'Select a SAM Application Runtime'
            },
            SourceError: {
                NotFound: {
                    id: 'AWS.samcli.initWizard.source.error.notFound',
                    defaultText: 'Project created successfully, but main source code file not found: {0}'
                },
                NotInWorkspace: {
                    id: 'AWS.samcli.initWizard.source.error.notInWorkspace',
                    defaultText:
                        "Could not open file '{0}'. If this file exists on disk, try adding it to your workspace."
                }
            }
        }
    },
    InitWizard: {
        Location: {
            SelectFolder: {
                id: 'AWS.initWizard.location.select.folder',
                defaultText: 'Select a different folder...'
            },
            SelectFolderEmptyWorkspace: {
                id: 'AWS.initWizard.location.select.folder.empty.workspace',
                defaultText: 'There are no workspace folders open. Select a folder...'
            }
        },
        NameBrowseOpenLabel: {
            id: 'AWS.initWizard.name.browse.openLabel',
            defaultText: 'Open'
        }
    },
    Wizard: {
        SelectedPreviously: {
            id: 'AWS.wizard.selectedPreviously',
            defaultText: 'Selected Previously'
        }
    },
    GenericResponse: {
        No: {
            id: 'AWS.generic.response.no',
            defaultText: 'No'
        },
        Yes: {
            id: 'AWS.generic.response.yes',
            defaultText: 'Yes'
        }
    },
    TemplateError: {
        ShowErrorDetails: {
            Title: {
                id: 'AWS.template.error.showErrorDetails.title',
                defaultText: 'Error details for'
            },
            ErrorCode: {
                id: 'AWS.template.error.showErrorDetails.errorCode',
                defaultText: 'Error code'
            },
            ErrorMessage: {
                id: 'AWS.template.error.showErrorDetails.errorMessage',
                defaultText: 'Error message'
            }
        }
    }
}
