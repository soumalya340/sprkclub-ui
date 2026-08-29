# WaveHack 3 Og network

SECTION 1 :

0G BRIDGE BUILDATHON (AKINDO) \- WHAT IT TAKES TO WIN  
Wave 3 | Deadline 30 Aug 2026, 20:30 IST | Pool $15,000 ($7,500 USDC \+ $7,500 0G credits)

SECTION 1 \- STRATEGY, JUDGING AND SUBMISSION

HOW YOU ARE SCORED

Progress & Momentum \- 40 percent. Meaningful advancement of the project during this wave, whatever stage you are at.

0G Integration \- 30 percent. Depth and quality of your use of the 0G modular stack (Chain, Compute, Storage, Agentic ID, 0G Pay).

Technical Quality & Execution \- 20 percent. Code quality, architecture, security, completeness.

Traction & Communication \- 10 percent. Real usage where applicable, documentation, demo clarity, public updates.

Judging is done by AKINDO’s DD Arena AI evaluation system plus human review by designated 0G judges. 0G’s DevRel team separately verifies genuine 0G integration before USDC is released. Evaluation is progress-based each wave, not against fixed milestones.

KEY TAKEAWAY. Integration is only 30 percent. Which modules you pick is a gate, not a differentiator. The 40 percent goes to whoever most visibly moved a real thing forward during the wave.

MANDATORY SUBMISSION CHECKLIST

Every item below is a gate. Missing one costs more than a weak feature.

One \- Project information. Name, one-line description (max 30 words), short summary covering what it does, what problem it solves, and which 0G components it uses.

Two \- Code repository. Public GitHub repo, or shared with judges. Meaningful commits made DURING the wave period. README with setup instructions.

Three \- 0G integration proof (Wave 3 onwards). 0G mainnet contract address. 0G Explorer link showing on-chain activity. Clear proof of at least one 0G component integrated.

Four \- Demo video. Maximum 3 minutes. Show core functionality, user flow, and the 0G integration. Hosted publicly on YouTube or Loom.

Five \- Documentation. Architecture diagram or technical description. Which 0G modules are used and how. Local deployment or reproduction steps.

Six \- Public X post. Mandatory. Project name, demo screenshot or short clip, hashtags 0GBridge and BuildOn0G, and tags for 0G_labs, 0G_Builders and AKINDO_io (each with the at-prefix on X).

Seven \- Optional bonus material. Pitch deck, user feedback or testing notes, tutorial or technical write-up, frontend demo link.

THE 0G STACK \- WHAT IS ACTUALLY REAL

The buildathon page lists eight things. 0G’s own Builder Hub backs four of them. Know the difference before you claim an integration.  
0G Chain. Real and documented. EVM L1, chain ID 16661, mainnet RPC at [evmrpc.0g.ai](http://evmrpc.0g.ai). Your contracts live here. This is what produces the required contract address and explorer trail.  
0G Chain. Real and documented. EVM L1, chain ID 16661, mainnet RPC at [evmrpc.0g.ai](http://evmrpc.0g.ai). Your contracts live here. This is what produces the required contract address and explorer trail.

0G Compute Network. Real and documented. Decentralized GPU marketplace for inference and fine-tuning, TEE-verified on Intel TDX and NVIDIA H100/H200. This is where the AI in AI-x-onchain actually runs.

0G Storage. Real and documented. Erasure-coded decentralized storage. Go and TypeScript SDKs plus official starter kits. Mainnet indexer at [indexer-storage-turbo.0g.ai](http://indexer-storage-turbo.0g.ai).

Agentic ID (ERC-7857). Real and documented, but you deploy your own contract \- there is no canonical address. Still an open PR against ethereum/ERCs, not a ratified standard.

0G Data Availability. Real but gated. The buildathon page says to contact the 0G team, and frames it as for high-throughput needs only. Not named in the judging criteria.

0G Pay. Live as a product, not as a developer surface. It is the funding layer for 0G Private Computer (fiat via card, crypto across 40-plus chains, native 0G deposits) and the pipe your buildathon credits arrive through. There is no docs page and no payment SDK. Third-party integration routes through Khalani and the TokenFlight widget, not a 0G SDK.

0G App. A consumer product, not a component. Studio (vibe coding), Chat, Launcher Hub. It consumes Compute, Storage and Chain. There is no documented way to integrate it, and using it generates no contract address. Use it as a tool if convenient, never as your integration claim.

THE ARCHITECTURE THAT SCORES BEST

Agent runs on 0G Compute. Its artifacts, memory and outputs persist to 0G Storage. Storage returns a Merkle root hash, which you write into a contract on 0G Chain. Add Agentic ID only if your project genuinely transfers, sells, licenses or clones agents.

Why this shape wins. 0G Storage is content-addressed, not path-addressed \- the root hash is your only handle on the file, so you have to build a mapping layer anyway. Putting those root hashes on-chain turns work you cannot avoid into the exact integration proof the submission requires. One loop, four modules, one explorer link.

This is also the pattern 0G promotes itself. Every project in the Builder Hub showcase \- Shawarma Orchestrate, Alpha Dawg, Don’t Get Drained, Croisette, Orchestra \- is Compute plus Storage.

Warning on the static-only stack. Agentic ID plus Storage alone means nothing actually runs. You have tokenized an agent and filed it away. In an AI L1 buildathon a judge will ask what it does. Compute is the cheap fix \- it is an SDK call, not an architecture change.

TRAPS THAT COST POINTS

The mocked oracle. ERC-7857’s entire point is oracle-verified re-encryption on transfer. Stubbing it with a function that returns true, then claiming Agentic ID as your headline integration, is the first thing a technical judge finds. Either wire it to real TEE attestation or state plainly in the README that it is mocked and describe the production design.  
Testnet deploys. The Agentic ID integration guide ships with a testnet deploy command. Wave 3 requires mainnet for 0G Chain. Redeploy to chain ID 16661. Compute and DA may stay on testnet.  
Testnet deploys. The Agentic ID integration guide ships with a testnet deploy command. Wave 3 requires mainnet for 0G Chain. Redeploy to chain ID 16661\. Compute and DA may stay on testnet.  
Browser-side Storage calls. The indexer download function uses Node filesystem APIs that do not exist in browsers, and encrypted files need downloadToBlob rather than download. Run uploads from a small backend and keep the browser read-only.  
Browser-side Storage calls. The indexer download function uses Node filesystem APIs that do not exist in browsers, and encrypted files need downloadToBlob rather than download. Run uploads from a small backend and keep the browser read-only.

Breadth over depth. Four modules name-dropped in a README scores worse than two used deeply and demoed well. The criteria reward depth.

Skipping the X post. It is a hard gate. Miss it and the rest does not matter.

Docs rot. Several 0G concept pages return 404 and some still use the old INFT naming. When docs and the starter kit repos disagree, trust the repos.

WHAT ACTUALLY DECIDES IT

With 40 percent on progress and 24 submissions in this wave (59 builders overall), the winner is whoever most visibly moved a real thing forward in two weeks. Concretely that means a working demo, commit history dated inside the wave, a mainnet contract with genuine explorer activity, and a 3-minute video where something actually happens.

The module list is a gate. The demo and the delta are the differentiators.

Two further edges available this wave. Resubmission is allowed before the deadline, so ship early and update \- and state clearly what changed. And the Multi-Wave Completion Bonus rewards teams who submit in all five waves, so a submission now also buys a position in waves 4 and 5, which carry 20 and 25 percent of the total pool.

FINAL 48 HOURS \- PRIORITY ORDER  
One. Deploy your contract to 0G mainnet, chain ID 16661, and push at least one real transaction so the explorer link is not empty. Without this the integration section is blank.  
One. Deploy your contract to 0G mainnet, chain ID 16661, and push at least one real transaction so the explorer link is not empty. Without this the integration section is blank.

Two. Wire one deep integration end to end. Compute for inference, Storage for persistence. Make it work rather than making it broad.

Three. Record the demo video. Three minutes, show the flow, show the 0G integration explicitly on screen.

Four. Write the README. Setup steps, architecture diagram, which 0G modules and how, reproduction steps. Be honest about anything mocked.

Five. Post on X with the required tags and hashtags.

Six. Submit on AKINDO before 30 Aug 2026, 20:30 IST.

One open risk worth tracking. Wave 2 credits were still undistributed as of 27 Aug and builders are raising it publicly in the comments. 0G stated on 25 Aug that Wave 2 credits were scheduled for that week. Plan on funding your own mainnet gas rather than waiting on credits to arrive.

PLAIN ENGLISH SUMMARY

Everything above, in normal words.

What this thing is. 0G is paying people to build stuff on their blockchain. Five rounds, spread over ten weeks. This round has 15,000 dollars in it \- half is real money (USDC), half is vouchers you can only spend on 0G’s own services. It is the biggest round of the whole program, so it is the one to show up for.

How they decide who gets paid. Four things, in order of how much they matter. Did you actually get stuff done in the last two weeks (40 percent). Did you really use 0G’s tools or just mention them (30 percent). Is the code any good (20 percent). Does anyone use it, and can you explain it clearly (10 percent).

The one sentence that matters most. You do not win by picking the right 0G tools. You win by showing you built more, this round, than the other 23 teams. Picking tools just gets you through the door.

What you have to hand in. Seven things: a description, a public GitHub link with commits from this round, proof you put something live on 0G, a video under three minutes, some docs, and a post on X. That last one is not optional \- skip the X post and it does not matter how good the project is.

0G’s tools, translated. Chain is the blockchain itself \- where your code lives once it is public, and the thing that gives judges a link they can click to confirm you are real. Compute is rented GPUs \- this is where your AI actually thinks. Storage is a hard drive spread across lots of computers \- where your files go. Agentic ID is a way to turn an AI agent into something you can own and sell, like an NFT except the actual agent is inside it, not just a picture.

The three you can ignore. DA is locked behind asking 0G for permission. 0G Pay has nothing for developers to plug into \- it is just how you top up your account and how your prize vouchers arrive. 0G App is an app 0G made for regular people, not a thing you build with. None of these will earn you points.

What to build so it scores well. Your AI runs on Compute. It saves its work to Storage. Storage hands you back a receipt code. You save that receipt code into your contract on Chain. Done. This works because you have to put the receipt code somewhere anyway \- so the thing you were forced to build is also exactly the proof the judges asked for. Nothing wasted.

The trap to avoid. If you only use Agentic ID and Storage, nothing in your project actually runs. You have built a fancy box for an AI and put it on a shelf. A judge will watch your video and ask what it does. Adding Compute fixes this and takes an afternoon.

The other trap. Agentic ID has one security piece that is genuinely hard to build properly, and most people fake it. If you fake it, write that in your README and explain how you would do it for real. Getting caught faking it is worse than not using Agentic ID at all.

What to do with the time you have left, in order. Get a contract live on the real 0G network and make at least one transaction, so your proof link is not empty. Get one thing working properly instead of five things half working. Record the video. Write the README. Post on X with the tags. Submit on AKINDO before Sunday evening, 8:30 pm.

One thing to be careful about. People are still waiting on their prize vouchers from round 2, and they are complaining about it publicly. Do not plan around that money showing up in time. Pay for your own transaction fees.

Bottom line. Pick Compute plus Storage plus a contract on Chain. Build one thing that works. Film it. Post it. Submit it. That beats a longer list of tools every time.

SECTION 2 \- HOW TO ACTUALLY USE 0G STORAGE AND AGENTIC ID

Note on the code below. Google Docs converts straight quotes into curly ones. If you copy any snippet into an editor, replace the quotes before running it.

PART A \- 0G STORAGE

What it is, in one line. A content-addressed file store. You put a file in and get back a Merkle root hash. That hash is the only way to get the file back. There are no filenames and no folders.  
Install. For TypeScript: npm install @0gfoundation/0g-storage-ts-sdk ethers  
Install. For TypeScript: npm install @0gfoundation/0g-storage-ts-sdk ethers  
For Go: go get [github.com/0gfoundation/0g-storage-client](http://github.com/0gfoundation/0g-storage-client)  
Do not start from a blank project. Clone a starter kit: 0g-storage-ts-starter-kit or 0g-storage-go-starter-kit, both under [github.com/0gfoundation](http://github.com/0gfoundation). Setup is npm install, then cp .env.example .env, then add your private key. About five minutes to a working upload.  
Do not start from a blank project. Clone a starter kit: 0g-storage-ts-starter-kit or 0g-storage-go-starter-kit, both under [github.com/0gfoundation](http://github.com/0gfoundation). Setup is npm install, then cp .env.example .env, then add your private key. About five minutes to a working upload.

What you must configure. Four things: an EVM RPC endpoint, an indexer RPC endpoint, a private key, and a signer holding funds for gas.  
Mainnet values for Wave 3\. RPC is [evmrpc.0g.ai](http://evmrpc.0g.ai). Chain ID is 16661. Indexer in turbo mode is [indexer-storage-turbo.0g.ai](http://indexer-storage-turbo.0g.ai). Switch with the network mainnet flag or in your .env file.  
Mainnet values for Wave 3\. RPC is [evmrpc.0g.ai](http://evmrpc.0g.ai). Chain ID is 16661\. Indexer in turbo mode is [indexer-storage-turbo.0g.ai](http://indexer-storage-turbo.0g.ai). Switch with the network mainnet flag or in your .env file.

Upload, in four lines.  
const file \= await ZgFile.fromFilePath(filePath);  
const \[tree, treeErr\] \= await file.merkleTree();  
const \[tx, uploadErr\] \= await indexer.upload(file, RPC_URL, signer);  
await file.close();

The root hash comes off the merkle tree. Save it somewhere permanent. Lose it and the file is gone as far as you are concerned.

Download, in one line.  
const err \= await indexer.download(rootHash, outputPath, true);

Five things that will bite you.  
One. Node only. The download function uses filesystem APIs that do not exist in a browser, and Vite needs polyfills for Node modules. Run uploads and downloads from a small backend and keep the browser read-only.  
One. Node only. The download function uses filesystem APIs that do not exist in a browser, and Vite needs polyfills for Node modules. Run uploads and downloads from a small backend and keep the browser read-only.  
Two. Encrypted files do not decrypt through indexer.download. Use downloadToBlob instead.  
Two. Encrypted files do not decrypt through indexer.download. Use downloadToBlob instead.

Three. Large encrypted files buffer entirely in memory on download. Fine for a demo, a problem if you are claiming petabyte scale in your pitch.

Four. No key recovery. Lose the encryption key and the data is unreadable. Nothing server-side can help you.

Five. Uploads are transactions. Your signer needs real 0G for gas on mainnet.

The part that earns you points. Because there are no filenames, you have to build your own index mapping something meaningful \- a user, an agent, a model version \- to a root hash. Put that index in a smart contract on 0G Chain instead of a database. Same work either way, but now you have a mainnet contract address and real explorer activity, which is exactly what the submission demands.

A minimal version is enough.  
mapping(address \=\> bytes32\[\]) public roots;  
function record(bytes32 rootHash) external {  
 roots\[msg.sender\].push(rootHash);  
 emit Recorded(msg.sender, rootHash);  
}

That satisfies the integration proof and it is honest, because it is genuinely part of how your app works rather than a contract deployed to tick a box.

PART B \- AGENTIC ID (ERC-7857)

What it is, in one line. ERC-721 where the metadata is the agent itself \- weights, prompt, memory, config \- kept encrypted, with a re-encryption step on transfer so the seller cannot keep a working copy.  
Install. npm install @0gfoundation/0g-storage-ts-sdk @openzeppelin/contracts ethers hardhat  
Install. npm install @0gfoundation/0g-storage-ts-sdk @openzeppelin/contracts ethers hardhat  
Plus the dev dependency: npm install \--save-dev @nomicfoundation/hardhat-toolbox  
Environment variables the docs expect: PRIVATE_KEY, OG_RPC_URL, OG_STORAGE_URL, OG_COMPUTE_URL. The published values are testnet \- swap them for mainnet before you submit.  
Environment variables the docs expect: PRIVATE_KEY, OG_RPC_URL, OG_STORAGE_URL, OG_COMPUTE_URL. The published values are testnet \- swap them for mainnet before you submit.

The mint flow is four steps.

Step one, generate a random 32-byte encryption key:  
const encryptionKey \= crypto.randomBytes(32);

Step two, encrypt the agent metadata with it:  
const encryptedData \= await this.encryption.encrypt(JSON.stringify(metadata), encryptionKey);

Step three, upload the encrypted blob to 0G Storage and keep what comes back:  
const storageResult \= await this.storage.store(encryptedData);

Step four, seal the key for the owner and mint:  
const sealedKey \= await this.encryption.sealKey(encryptionKey, ownerPublicKey);  
const tx \= await contract.mint(recipient, encryptedURI, metadataHash);

On-chain you store only the encrypted URI and a bytes32 metadataHash. The agent itself never touches the chain. This is the same root-hash pattern from Part A, which is why Storage and Agentic ID are natural partners.

Transfer is the part that makes this ERC-7857 rather than ERC-721:  
await contract.transfer(from, to, tokenId, sealedKey, proof);

Inside the contract, two checks run:  
require(ownerOf(tokenId) \== from, "Not owner");  
require(IOracle(oracle).verifyProof(proof), "Invalid proof");  
(both revert strings are quoted in real Solidity)

The oracle interface is tiny:  
interface IOracle {  
 function verifyProof(bytes calldata proof) external view returns (bool);  
}

Deploy takes the oracle address as a constructor argument:  
new AgenticID("AI Agent NFTs", "AINFT", oracle.address);  
npx hardhat run scripts/[deploy.js](http://deploy.js) \--network og-testnet  
Change that network to mainnet for Wave 3\. Chain ID 16661.  
Change that network to mainnet for Wave 3\. Chain ID 16661\.  
The honest problem with the oracle. That verifyProof function is where the entire value of the standard lives. A real implementation decrypts inside a TEE, or proves via ZKP, generates a fresh key, re-encrypts for the recipient, and returns a proof the contract can verify. Writing one that just returns true takes thirty seconds, and that is what most submissions do.  
The honest problem with the oracle. That verifyProof function is where the entire value of the standard lives. A real implementation decrypts inside a TEE, or proves via ZKP, generates a fresh key, re-encrypts for the recipient, and returns a proof the contract can verify. Writing one that just returns true takes thirty seconds, and that is what most submissions do.

You have two acceptable options. Wire it to real TEE attestation \- 0G Compute runs Intel TDX and H100 or H200 enclaves, so there is a path \- or ship the stub and say so plainly in your README, with a paragraph on how you would build the real one. Judges reward the second far more than they punish it. What they punish is finding a fake oracle sitting behind a confident claim.

Reference code. The 0G docs point to [github.com/0gfoundation/0g-agent-nft](http://github.com/0gfoundation/0g-agent-nft), branch eip-7857-draft, for sample contracts. Start there rather than writing the token from scratch.

One caveat on the standard. ERC-7857 is still an open pull request against ethereum/ERCs, number 824\. It is not ratified. Fine for a buildathon \- just describe it as emerging rather than established.

PART C \- HOW THE TWO FIT TOGETHER

Storage and Agentic ID are two halves of one thing. Storage holds the encrypted agent and hands you a root hash. Agentic ID is the on-chain record of who owns the thing at that hash and who is allowed to run it. Neither is much use alone: Storage without the token is a file nobody owns, and the token without Storage points at nothing.

Add Compute and it becomes a full loop. The agent runs on Compute. Its updated memory and outputs get written to Storage. The new root hash updates the token metadata hash on Chain. That is a live agent whose whole history is verifiable, and it uses four 0G modules for an actual reason rather than to fill a checklist.

Build order if you are short on time. Storage first \- it is fastest to get working and it produces the root hashes everything else depends on. Then the contract on Chain that records them, which is your integration proof. Then Compute, so something actually runs. Agentic ID last, and only if your project genuinely involves owning, selling or licensing agents.

PART D \- TESTNET VERSUS MAINNET

Neither 0G Storage nor Agentic ID is mainnet-only. Both run on testnet. The mainnet requirement is a buildathon rule, not a technical limit.

Storage on testnet. Galileo has its own deployed storage contracts and its own storage explorer at [storagescan-galileo.0g.ai](http://storagescan-galileo.0g.ai). The SDK code is identical either way \- you swap the RPC and indexer endpoints and go.  
Flow: 0x22E03a6A89B950F1c82ec5e74F8eCa321a105296  
Mine: 0x00A9E9604b0538e06b268Fb297Df333337f9593b  
Reward: 0xA97B57b4BdFEA2D0a25e535bd849ad4e6C440A69

Agentic ID on testnet. There is no canonical deployment \- you deploy your own contract, so it runs anywhere EVM. The official integration guide’s deploy command targets testnet by default.

What actually forces mainnet. Wave 3 requires a 0G mainnet contract address plus an Explorer link showing on-chain activity. The buildathon page words it as mainnet being required for 0G Chain integration from Wave 3 onward, while Compute and DA may stay on testnet. Your Agentic ID contract is a Chain contract, so if it is your headline integration it has to be on mainnet. Storage uploads are transactions on whichever chain you point at, so run Storage on mainnet too \- otherwise your explorer trail is split across two networks and reads as half finished.

The two configurations.

Testnet (Galileo)  
Chain ID: 16602  
RPC: [evmrpc-testnet.0g.ai](http://evmrpc-testnet.0g.ai)  
Explorer: [chainscan-galileo.0g.ai](http://chainscan-galileo.0g.ai)  
Storage explorer: [storagescan-galileo.0g.ai](http://storagescan-galileo.0g.ai)  
Tokens: [faucet.0g.ai](http://faucet.0g.ai), limited to 0.1 0G per wallet per day

Mainnet  
Chain ID: 16661  
RPC: [evmrpc.0g.ai](http://evmrpc.0g.ai)  
Explorer: [chainscan.0g.ai](http://chainscan.0g.ai)  
Storage indexer: [indexer-storage-turbo.0g.ai](http://indexer-storage-turbo.0g.ai)  
Storage contracts \- Flow: 0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526, Mine: 0xCd01c5Cd953971CE4C2c9bFb95610236a7F414fe, Reward: 0x457aC76B58ffcDc118AABD6DbC63ff9072880870  
Tokens: no faucet \- buy or bridge. Official guide at [get.0g.ai](http://get.0g.ai)

The sensible plan with two days left. Build and debug on testnet where tokens are free. Then redeploy to mainnet and run a handful of real transactions before submitting. You only need enough mainnet 0G for a contract deploy plus a few uploads, which is not much.

The one thing to budget for. There is no mainnet faucet \- you have to buy or bridge 0G. Combined with Wave 2 credits still not having landed, do not leave that step until Sunday afternoon.
