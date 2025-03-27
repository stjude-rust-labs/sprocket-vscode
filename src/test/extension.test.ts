import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import * as extension from '../extension';
import { getApi } from "@microsoft/vscode-file-downloader-api";

// Mock external dependencies
jest.mock("@microsoft/vscode-file-downloader-api", () => ({
  getApi: jest.fn(),
}));

suite("Extension Test Suite", () => {
  let sandbox: sinon.SinonSandbox;
  
  setup(() => {
    sandbox = sinon.createSandbox();
    // Reset mocks between tests
    jest.clearAllMocks();
  });
  
  teardown(() => {
    sandbox.restore();
  });

  test("Extension activates successfully", async () => {
    // Mock the file downloader API
    const mockDownloader = {
      getItem: jest.fn().mockRejectedValue(new Error("Not found")),
      downloadFile: jest.fn().mockResolvedValue(vscode.Uri.file("/mock/path/sprocket-package"))
    };
    (getApi as jest.Mock).mockResolvedValue(mockDownloader);
    
    // Mock extension context
    const context = {
      subscriptions: [],
      extensionPath: "/mock/extension/path",
      asAbsolutePath: (path: string) => `/mock/extension/path/${path}`
    } as unknown as vscode.ExtensionContext;
    
    // Mock fetch for version checking
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({
        crates: [{ name: "sprocket", max_stable_version: "0.1.0" }]
      }),
      text: jest.fn().mockResolvedValue("")
    });

    // Mock filesystem functions
    const fsExistsSpy = sandbox.stub(require('fs'), 'existsSync').returns(true);
    const fsReadSpy = sandbox.stub(require('fs'), 'readFileSync').returns("0.1.0");
    const fsWriteSpy = sandbox.stub(require('fs'), 'writeFileSync');
    
    // Mock tar extraction
    const tarExtractSpy = sandbox.stub(require('tar'), 'x').resolves();
    
    // Mock VS Code commands
    const executeCommandStub = sandbox.stub(vscode.commands, 'executeCommand').resolves();
    
    // Test activation
    await extension.activate(context);
    
    // Assertions to verify proper activation
    assert.strictEqual(context.subscriptions.length > 0, true, "No items added to subscriptions");
    assert(fsExistsSpy.called, "existsSync should be called during activation");
  });

  test("Server restart command works", async () => {
    // Mock VS Code commands and the client
    const restartServerSpy = sandbox.spy(extension, 'restartServer');
    
    // Execute the command
    await vscode.commands.executeCommand('sprocket.restartServer');
    
    // Verify the restart function was called
    assert(restartServerSpy.calledOnce, "restartServer should be called when command is executed");
  });

  test("Configuration change detection works", async () => {
    // Mock configuration change event
    const configChangeEvent = {
      affectsConfiguration: sandbox.stub().returns(true)
    } as unknown as vscode.ConfigurationChangeEvent;
    
    // Mock window.showInformationMessage
    const showMessageStub = sandbox.stub(vscode.window, 'showInformationMessage')
      .resolves('Restart now');
    
    // Mock commands.executeCommand
    const executeCommandStub = sandbox.stub(vscode.commands, 'executeCommand').resolves();
    
    // Trigger configuration change
    await extension.onDidChangeConfiguration(configChangeEvent);
    
    // Verify proper handling
    assert(showMessageStub.calledOnce, "Information message should be shown on config change");
    assert(executeCommandStub.calledWith('sprocket.restartServer'), 
      "Restart command should be executed when user confirms");
  });
});
