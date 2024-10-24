import * as anchor from '@coral-xyz/anchor'
import { startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import {Voting} from '../target/types/voting';
import { experimental_useEffectEvent } from 'react';
import { beforeEach } from 'node:test';
import { publicKey } from '@coral-xyz/anchor/dist/cjs/utils';
// import '@types/jest';

const IDL = require('../target/idl/voting.json');

const votingAddress = new PublicKey("Ad6VnrGsr5vHNHkRu7D4b5TsCZQiUSmFrJquABQ8NetX");

describe('voting', () => {
  
  let context;
  let provider;
  anchor.setProvider(anchor.AnchorProvider.env());
  let votingProgram = anchor.workspace.Voting as Program<Voting>;

  beforeAll(async() => {
      /*context = await startAnchor("", [{name: "voting", programId: votingAddress}], []);
      provider = new BankrunProvider(context);
      votingProgram = new Program<Voting>(IDL, provider);
      */

  })

  it('Initialize Poll', async () => {
    
    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "What is your fav color?",
      new anchor.BN(0),
      new anchor.BN(1828873091),
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync([new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
    votingAddress,
  )

  const poll = await votingProgram.account.poll.fetch(pollAddress);

  console.log(poll);

  expect(poll.pollId.toNumber()).toEqual(1);
  expect(poll.description).toEqual("What is your fav color?"); 
  })

  it("initialize candidate", async() => {
    await votingProgram.methods.initializeCandidate(
      "Red",
      new anchor.BN(1),
    ).rpc();
    await votingProgram.methods.initializeCandidate(
      "Green",
      new anchor.BN(1),
    ).rpc();

    const [greenAddresss] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Green")],
      votingAddress
    );
     
    const greenCandidate = await votingProgram.account.candidate.fetch(greenAddresss);

    console.log(greenCandidate);

    expect(greenCandidate.candidateVotes.toNumber()).toEqual(0);
  })

  it("vote", async() => {
    await votingProgram.methods.vote(
        "Green",
        new anchor.BN(1)).rpc();

        const [greenAddresss] = PublicKey.findProgramAddressSync(
          [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Green")],
          votingAddress
        );
         
        const greenCandidate = await votingProgram.account.candidate.fetch(greenAddresss);
        expect(greenCandidate.candidateVotes.toNumber()).toEqual(1);
    
  })
})
